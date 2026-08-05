# DoodleNet — QuickDraw sketch classifier

TensorFlow.js layers model (CNN, 28×28×1 input) that classifies hand-drawn
sketches into 345 [Quick, Draw!](https://quickdraw.withgoogle.com/data)
categories. Used by the Guess My Drawing game.

- Source: [ml5js/ml5-data-and-models](https://github.com/ml5js/ml5-data-and-models)
  (`models/doodlenet/`), created by Yining Shi for [ml5.js](https://ml5js.org).
- License: MIT (Copyright (c) 2018 ml5) — https://github.com/ml5js/ml5-data-and-models/blob/main/LICENSE
- Trained on the Google Quick, Draw! dataset, released by Google under CC BY 4.0.
- Files: `model.json` (topology), `group1-shard1of1.bin` (weights, ~2.1MB),
  `class_names.txt` (output index → category name, one per line).
- Local patch: removed a stale `batch_input_shape` from the second Conv2D
  layer's config in `model.json` — the original export declared `[null,28,28,1]`
  there, which modern tfjs-layers rejects (the layer actually receives 16
  channels). Weights are untouched.

Served statically; all inference happens in the player's browser. No drawing
data ever leaves the device.
