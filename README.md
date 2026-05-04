# Decisão Épica

Aplicativo mobile de roleta interativa para auxiliar na tomada de decisões. Crie roletas personalizadas, defina pesos para cada opção e deixe a sorte decidir.

## Tecnologias

- **React Native** 0.81.5 com New Architecture
- **Expo** ~54.0.23
- **React Navigation** 7.x (Native Stack)
- **React Native Reanimated** ~4.1.1 (animações)
- **React Native SVG** 15.12.1 (renderização da roda)
- **AsyncStorage** (persistência local)
- **Expo Document Picker / Sharing** (import/export de backups)

## Estrutura do Projeto

```
src/
├── components/
│   ├── OptionItem.js        # Linha de opção na tela de detalhe
│   ├── RoletaCard.js         # Card da roleta na tela inicial
│   ├── WeightInput.js        # Input de peso para opções
│   └── WheelCanvas.js        # Renderização SVG da roda (com cache LRU)
├── context/
│   └── RoletaContext.js      # Context API - estado global das roletas
├── hooks/
│   └── useImagePicker.js     # Hook para seleção de imagens
├── screens/
│   ├── HomeScreen.js         # Lista de grupos e roletas
│   ├── RoletaDetailScreen.js # Configuração de opções da roleta
│   ├── WheelScreen.js        # Tela da roleta giratória (animação)
│   └── ResultScreen.js       # Exibição do resultado do sorteio
└── utils/
    ├── storage.js            # Persistência (AsyncStorage, export/import)
    └── wheel.js              # Lógica da roda (segmentos, sorteio pesado)
```

## Funcionalidades

### Grupos
- Criar, renomear e excluir grupos de roletas
- Organização visual com seções expansíveis
- Pesquisa dentro de cada grupo e global

### Roletas
- Múltiplas roletas organizadas por grupos
- Mover roletas entre grupos
- Backup/restore via JSON (exportar e importar)
- Cada roleta tem: nome, imagem de capa, e opções

### Opções (dentro de cada roleta)
- Texto da opção
- Imagem personalizada (via galeria)
- Peso customizável (influencia a probabilidade)
- Reordenação via drag-and-drop
- Adição/remoção dinâmica

### Sorteio
- Animação realista da roleta girando (Reanimated)
- Sorteio ponderado por peso (opções com peso maior têm mais chance)
- Confetti ao exibir o resultado
- Opção de desativar animação para testes rápidos

## Como rodar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npx expo start

# Ou atalhos:
npx expo start --android    # Android
npx expo start --ios        # iOS
npx expo start --web        # Web
```

Escaneie o QR code com o app **Expo Go** no celular, ou use um emulador.

## Testes

```bash
npm test
```

## Build para produção

```bash
npx expo run:android    # Gera APK/AAB
npx expo run:ios        # Requer macOS + Xcode
```

## Notas técnicas

- **Sorteio pesado**: O algoritmo `chooseWeightedSegment` em `src/utils/wheel.js` sorteia com base no peso (`weight`) de cada opção. Opções com peso 0 são ignoradas.
- **Animação da roda**: O `WheelScreen.js` usa `Animated.timing` com interpolação de graus. O `rotationSeed` mantém a posição fracionária entre giros, garantindo que a roda sempre gire para frente.
- **Cache LRU**: O `WheelCanvas.js` usa cache LRU para cálculos de geometria SVG (polarToCartesian, describeArc), melhorando performance com muitas opções.
- **Migração de dados**: O `storage.js` tenta automaticamente migrar dados de versões anteriores do app.
