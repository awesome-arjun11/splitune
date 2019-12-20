# splitune
> An attempt at user friendly Desktop App for [deezer's Spleeter](https://github.com/deezer/spleeter). Splitune Allows separating Vocals and instruments. It can split vocals,drums,piano,bass and other accompaniment based on pretrained models.

## Demo Video:
  

  [![Splitune](https://i.imgur.com/s6mzIfM.png)](https://youtu.be/qyNRQZNBvGk "Splitune UI : click to see demo")

  >https://youtu.be/qyNRQZNBvGk

## Manual setup of models
  1. Download Models from [Spleeter releases](https://github.com/deezer/spleeter/releases).
  2. Extract them in **pretrained_models** directory. 

      ```bash
      Splitune
      ├── pretrained_models
      │   ├── 2stems
      │   │   ├── model.data-####-####
      │   │	├── model.meta
      │   │   ├──	mode.index
      │   │
      │   ├── 4stems  
      │   └── 5stems
      ├── web
      ├── node_modules
      ├── app.py
      ├── main.js
      ├── requirements.txt
      ├── README.md
      ├── package.json
      ├── package-lock.json
      └── .gitignore
      ```
              

## To Do List
  1. Packaging python app with electron into executable binary for release.
  2. Optimise downloader with multiple threads
