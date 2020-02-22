# SpliTune : Music Spleeter
[![forthebadge made-with-python](https://ForTheBadge.com/images/badges/made-with-python.svg)](https://www.python.org/)

[![GitHub license](https://img.shields.io/badge/License-MIT-brightgreen.svg?style=for-the-badge)](https://github.com/awesome-arjun11/splitune/blob/master/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)
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
              
## [Releases](https://github.com/awesome-arjun11/splitune/releases/)
### Latest
  1. [Alpha - Portable - v0.2](https://github.com/awesome-arjun11/splitune/releases/tag/v0.2-alpha)

## To Do List
 1. MonkeyPatch dependencies for pyinstaller build.
 
## References
  #### 1. [Spleeter](https://github.com/deezer/spleeter)
    ```
    @misc{spleeter2019,
    title={Spleeter: A Fast And State-of-the Art Music Source Separation Tool With Pre-trained Models},
    author={Romain Hennequin and Anis Khlif and Felix Voituret and Manuel Moussallam},
    howpublished={Late-Breaking/Demo ISMIR 2019},
    month={November},
    note={Deezer Research},
    year={2019}
    }
    ```
