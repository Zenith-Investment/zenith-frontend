# Guia de Deploy na Vercel - Zenith Frontend

Este documento contém instruções para fazer deploy do frontend Zenith na Vercel e resolver problemas comuns.

## Problemas Resolvidos

### ✅ 1. Erro 404 - manifest.json
**Problema:** `Failed to load resource: the server responded with a status of 404 () manifest.json:1`

**Solução:** Criado arquivo `/public/manifest.json` com configurações PWA completas para a aplicação Zenith.

### ✅ 2. Erro de Fontes não renderizadas
**Problema:** Fontes do Google (Inter) estavam comentadas devido a problemas de rede no WSL2, causando falhas de renderização.

**Solução:**
- Removidas as referências a fontes do Google que não estavam sendo utilizadas
- Implementado fallback para fontes do sistema via CSS inline no body
- Fontes do sistema utilizadas: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`

### ✅ 3. Logos Light/Dark
**Problema:** Logos não estavam sendo aplicadas corretamente baseado no tema.

**Solução:**
- Criado componente `Logo` (`/src/components/logo.tsx`) que detecta o tema atual
- Organização dos arquivos de logo:
  - `/public/logo-light.png` - para tema claro
  - `/public/logo-dark.png` - para tema escuro
  - `/public/logo.png` - logo padrão
- Integrado no sidebar para alternar automaticamente entre temas

## Configuração da Vercel

### Variáveis de Ambiente

Certifique-se de configurar as seguintes variáveis de ambiente no painel da Vercel:

```bash
NEXT_PUBLIC_API_URL=https://sua-api.com/api/v1
```

### Build Settings

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node Version:** 18.x ou superior

### Deploy

1. **Via GitHub (Recomendado):**
   - Conecte o repositório ao projeto Vercel
   - Cada push para `main` fará deploy automaticamente
   - PRs criam preview deployments

2. **Via CLI:**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

## Assets Pendentes

Os seguintes assets ainda precisam ser criados para uma experiência completa:

- [ ] `apple-touch-icon.png` (180x180px)
- [ ] `icon-192x192.png` (192x192px)
- [ ] `icon-512x512.png` (512x512px)
- [ ] `og-image.png` (1200x630px)
- [ ] `twitter-image.png` (1200x630px)

Veja `/public/README.md` para mais detalhes sobre como criar esses assets.

## Verificação Pós-Deploy

Após o deploy, verifique:

1. ✅ **Manifest carregando:** Abra DevTools > Application > Manifest
2. ✅ **Fontes renderizando:** Inspecione elementos e verifique font-family
3. ✅ **Logo alternando:** Mude o tema e verifique se a logo muda
4. ✅ **Favicons:** Verifique se os favicons estão carregando
5. ✅ **Lighthouse Score:** Execute o Lighthouse para verificar PWA e performance

## Próximos Passos

### Performance
- [ ] Otimizar imagens (usar `next/image` em todos os lugares)
- [ ] Implementar lazy loading para componentes pesados
- [ ] Configurar cache headers adequados

### PWA
- [ ] Criar service worker customizado
- [ ] Implementar offline fallback
- [ ] Adicionar installability prompts

### SEO
- [ ] Criar sitemap.xml
- [ ] Adicionar robots.txt customizado
- [ ] Implementar structured data para páginas principais

## Troubleshooting

### Erro: "Module not found"
- Execute `npm install` novamente
- Limpe o cache: `rm -rf .next && npm run build`

### Logo não aparece
- Verifique se os arquivos estão em `/public/logo-*.png`
- Confirme que o componente Logo está sendo importado corretamente
- Verifique console para erros de Next/Image

### Tema não alterna
- Verifique se `next-themes` está instalado
- Confirme que `<ThemeProvider>` está no root layout
- Teste em modo incógnito (pode ser cache do navegador)

## Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Web App Manifest](https://web.dev/add-manifest/)
- [PWA Best Practices](https://web.dev/pwa-checklist/)

## Contato

Para problemas ou dúvidas sobre o deploy, consulte a equipe de desenvolvimento.
