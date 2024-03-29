# Gamecube BIOS UI simulator
## Description
This is a work-in-progress attempt to recreate the Gamecube IPL UI using Three.js.

[Screencast_20231130_202028.webm](https://github.com/etiandre/gcuisim/assets/229481/8bcbbea4-0b42-4aec-a684-1ee43eb1b9a4)

## Installation & Usage
### Demo
```
$ git clone https://github.com/etiandre/gcuisim.git
$ npm install
$ npm start
```

Use the arrow keys to navigate.
### Building
`npm build` builds the app into the `dist/` folder.

## Details
 - The font used is Source Sans Pro Bold, as the original IPL font is hard to obtain and probably copyrighted.
 - The shiny reflection texture is the original one (see https://tcrf.net/GameCube).

## TODO
 - Loading screen
 - Sound
 - Background particle cube effects
 - Modal screens

 ## License
 See `LICENSE`.
 
