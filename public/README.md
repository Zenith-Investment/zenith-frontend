# Public Assets

Esta pasta contém os assets estáticos da aplicação Zenith.

## Assets Criados

- ✅ `manifest.json` - Web App Manifest para PWA
- ✅ `icon.svg` - Ícone SVG temporário com letra "Z"
- ✅ `favicon.ico` - Favicon temporário
- ✅ `robots.txt` - Configuração para crawlers
- ✅ `logo.png` - Logo principal (versão light)
- ✅ `logo-light.png` - Logo para tema claro
- ✅ `logo-dark.png` - Logo para tema escuro
- ✅ `zenith_versao_light.png` - Logo original versão light
- ✅ `zenith_versao_light2.png` - Logo original versão light alternativa
- ✅ `zenith_versao_dark.png` - Logo original versão dark

## Assets Pendentes (TODO)

Os seguintes arquivos são referenciados no código mas ainda precisam ser criados:

### Ícones da Aplicação
- ❌ `apple-touch-icon.png` (180x180px) - Ícone para dispositivos Apple
- ❌ `icon-192x192.png` (192x192px) - Ícone PWA para Android
- ❌ `icon-512x512.png` (512x512px) - Ícone PWA para Android

### Imagens Open Graph / Social Media
- ❌ `og-image.png` (1200x630px) - Imagem para compartilhamento Open Graph
- ❌ `twitter-image.png` (1200x630px) - Imagem para Twitter Cards

### Branding
- ❌ `logo.png` - Logo completo da Zenith

## Como Criar os Ícones

1. **Design**: Crie o design do ícone/logo no Figma ou ferramenta similar
2. **Exportar nos tamanhos corretos**:
   - 180x180px para Apple Touch Icon
   - 192x192px e 512x512px para PWA
   - 1200x630px para imagens sociais

3. **Otimizar**: Use ferramentas como:
   - [TinyPNG](https://tinypng.com/) para comprimir PNGs
   - [SVGOMG](https://jakearchibald.github.io/svgomg/) para otimizar SVGs

4. **Substituir**: Coloque os arquivos nesta pasta (`/public`)

## Referências

- Web App Manifest: https://web.dev/add-manifest/
- PWA Icons: https://web.dev/maskable-icon/
- Open Graph: https://ogp.me/
- Twitter Cards: https://developer.twitter.com/en/docs/twitter-for-websites/cards
