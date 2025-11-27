"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Coins,
  SplitSquareVertical,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useTransactions,
  useDeleteTransaction,
  Transaction,
  TransactionType,
} from "@/hooks/use-transactions";
import { exportTransactions } from "@/hooks/use-exports";
import { useToast } from "@/hooks/use-toast";

const ASSET_LABELS: Record<string, string> = {
  stocks: "Acao",
  fiis: "FII",
  fixed_income: "Renda Fixa",
  etf: "ETF",
  crypto: "Crypto",
  bdr: "BDR",
  funds: "Fundo",
  cash: "Reserva",
  other: "Outro",
};

const TRANSACTION_CONFIG: Record<
  TransactionType,
  { label: string; icon: React.ElementType; color: string }
> = {
  buy: { label: "Compra", icon: ArrowUpCircle, color: "text-green-500" },
  sell: { label: "Venda", icon: ArrowDownCircle, color: "text-red-500" },
  dividend: { label: "Dividendo", icon: Coins, color: "text-blue-500" },
  split: { label: "Desdobramento", icon: SplitSquareVertical, color: "text-purple-500" },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

function TransactionRow({
  transaction,
  onDelete,
}: {
  transaction: Transaction;
  onDelete: (id: number) => void;
}) {
  const config = TRANSACTION_CONFIG[transaction.transaction_type];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between border-b py-4 last:border-0">
      <div className="flex items-center gap-4">
        <div className={`rounded-full bg-muted p-2 ${config.color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{transaction.ticker}</span>
            <Badge variant="secondary" className="text-xs">
              {ASSET_LABELS[transaction.asset_class] || transaction.asset_class}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {config.label}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(transaction.transaction_date), "dd MMM yyyy", {
              locale: ptBR,
            })}
            {transaction.notes && (
              <span className="ml-2 italic">- {transaction.notes}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="font-medium">
            {transaction.quantity.toLocaleString("pt-BR")} x{" "}
            {formatCurrency(transaction.price)}
          </div>
          <div className="text-sm text-muted-foreground">
            Total: {formatCurrency(transaction.total_value)}
            {transaction.fees > 0 && (
              <span className="ml-1">(+{formatCurrency(transaction.fees)} taxas)</span>
            )}
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir transacao?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acao nao pode ser desfeita. A transacao sera removida do historico,
                mas as alteracoes no ativo nao serao revertidas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(transaction.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function TransactionSkeleton() {
  return (
    <div className="flex items-center justify-between border-b py-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div>
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton className="h-5 w-28 mb-1" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [isExporting, setIsExporting] = useState(false);
  const pageSize = 20;

  const { data, isLoading, error } = useTransactions({
    page,
    pageSize,
    transactionType: typeFilter === "all" ? undefined : typeFilter,
  });

  const deleteMutation = useDeleteTransaction();

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleExport = async (format: "excel" | "csv") => {
    setIsExporting(true);
    try {
      await exportTransactions(format);
      toast({
        title: "Exportacao concluida",
        description: `Transacoes exportadas com sucesso para ${format.toUpperCase()}.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Erro na exportacao",
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
  const hasTransactions = data && data.transactions.length > 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Historico de Transacoes</h1>
          <p className="text-muted-foreground mt-1">
            Visualize todas as suas operacoes de compra, venda, dividendos e desdobramentos
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isExporting || !hasTransactions}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExport("excel")}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("csv")}>
              <Download className="h-4 w-4 mr-2" />
              CSV (.csv)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Transacoes</CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value as TransactionType | "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="buy">Compras</SelectItem>
                <SelectItem value="sell">Vendas</SelectItem>
                <SelectItem value="dividend">Dividendos</SelectItem>
                <SelectItem value="split">Desdobramentos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8 text-destructive">
              Erro ao carregar transacoes. Tente novamente mais tarde.
            </div>
          )}

          {isLoading && (
            <div>
              {[...Array(5)].map((_, i) => (
                <TransactionSkeleton key={i} />
              ))}
            </div>
          )}

          {data && data.transactions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhuma transacao encontrada</p>
              <p className="text-sm mt-1">
                {typeFilter !== "all"
                  ? "Tente remover o filtro para ver todas as transacoes"
                  : "Adicione ativos a sua carteira para registrar transacoes"}
              </p>
            </div>
          )}

          {data && data.transactions.length > 0 && (
            <>
              <div className="divide-y">
                {data.transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {(page - 1) * pageSize + 1} -{" "}
                    {Math.min(page * pageSize, data.total)} de {data.total} transacoes
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <span className="text-sm px-2">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages}
                    >
                      Proximo
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
