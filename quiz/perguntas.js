const perguntas = 
[
    {
        pergunta: "Which bird can sing the national anthem?",
        respostas:
        {
            a: {resposta: "Corrupião", correta: true},
            b: {resposta: "Blackbird", correta: false},
            c: {resposta: "Brazilian Canary", correta: false},
            d: {resposta: "Saffron Finch", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual o pássaro que sabe cantar o hino nacional?",
                respostas: {
                    a: { resposta: "Corrupião" },
                    b: { resposta: "Pássaro-Preto" },
                    c: { resposta: "Canário-da-Terra" },
                    d: { resposta: "Trinca-Ferro" }
                }
            },
            es: {
                pergunta: "¿Qué pájaro puede cantar el himno nacional?",
                respostas: {
                    a: { resposta: "Corrupião" },
                    b: { resposta: "Mirlo" },
                    c: { resposta: "Canario brasileño" },
                    d: { resposta: "Pinzón de azafrán" }
                }
            },
            fr: {
                pergunta: "Quel oiseau peut chanter l'hymne national ?",
                respostas: {
                    a: { resposta: "Corrupião" },
                    b: { resposta: "Merle" },
                    c: { resposta: "Canari brésilien" },
                    d: { resposta: "Chardonneret jaune" }
                }
            },
            it: {
                pergunta: "Quale uccello sa cantare l'inno nazionale?",
                respostas: {
                    a: { resposta: "Corrupião" },
                    b: { resposta: "Merlo" },
                    c: { resposta: "Canarino brasiliano" },
                    d: { resposta: "Cardellino giallo" }
                }
            },
            de: {
                pergunta: "Welcher Vogel kann die Nationalhymne singen?",
                respostas: {
                    a: { resposta: "Corrupião" },
                    b: { resposta: "Amsel" },
                    c: { resposta: "Brasilianischer Kanarienvogel" },
                    d: { resposta: "Goldammer" }
                }
            }
        }
    },
    {
        type: 'audio',
        pergunta: "Which bird makes this sound?",
        respostas:
        {
            a: {resposta: "Bem-te-vi", correta: true},
            b: {resposta: "Sabiá", correta: false},
            c: {resposta: "Hummingbird", correta: false},
            d: {resposta: "Macaw", correta: false},
        },
        audioSrc: "../js/piados/bemtevipiado.mp3",
        imageFile: "bem-te-vi-vetor.png",
        videoId: "z3jwepapUcY",
        audioTitle: "Listen to the bird call and choose",
        audioNoteText: "Tap the button to hear the bird sound",
        playButton: "Play sound",
        translations: {
            pt: {
                pergunta: "Qual pássaro é este som?",
                audioTitle: "Ouça o piado e escolha o pássaro",
                audioNoteText: "Toque no botão para ouvir o som do pássaro",
                playButton: "Tocar piado",
                respostas: {
                    a: { resposta: "Bem-te-vi" },
                    b: { resposta: "Sabiá" },
                    c: { resposta: "Beija-flor" },
                    d: { resposta: "Arara" }
                }
            }
        }
    },
    {
        type: 'audio',
        pergunta: "Which bird has the short floating song?",
        respostas:
        {
            a: {resposta: "Coleiro", correta: true},
            b: {resposta: "Sabiá", correta: false},
            c: {resposta: "Tiziu", correta: false},
            d: {resposta: "Hummingbird", correta: false},
        },
        audioSrc: "../js/piados/coleiropiado.mp3",
        imageFile: "coleiro-vetor.png",
        videoId: "RwZU5FWuZs4",
        audioTitle: "Listen to the bird call and choose",
        audioNoteText: "Tap the button to hear the bird sound",
        playButton: "Play sound",
        translations: {
            pt: {
                pergunta: "Qual pássaro tem o canto curto e flutuante?",
                audioTitle: "Ouça o piado e escolha o pássaro",
                audioNoteText: "Toque no botão para ouvir o som do pássaro",
                playButton: "Tocar piado",
                respostas: {
                    a: { resposta: "Coleiro" },
                    b: { resposta: "Sabiá" },
                    c: { resposta: "Tiziu" },
                    d: { resposta: "Beija-Flor" }
                }
            }
        }
    },
    {
        type: 'audio',
        pergunta: "Which bird makes this quick bright sound?",
        respostas:
        {
            a: {resposta: "Sabiá", correta: false},
            b: {resposta: "Hummingbird", correta: true},
            c: {resposta: "Tiziu", correta: false},
            d: {resposta: "Quero-Quero", correta: false},
        },
        audioSrc: "../js/piados/beijaflorpiado.wav",
        imageFile: "beija-flor-vetor.png",
        videoId: "cbdLm7vGpqI",
        audioTitle: "Listen to the bird call and choose",
        audioNoteText: "Tap the button to hear the bird sound",
        playButton: "Play sound",
        translations: {
            pt: {
                pergunta: "Qual é o pássaro do som rápido e brilhante?",
                audioTitle: "Ouça o piado e escolha o pássaro",
                audioNoteText: "Toque no botão para ouvir o som do pássaro",
                playButton: "Tocar piado",
                respostas: {
                    a: { resposta: "Sabiá" },
                    b: { resposta: "Beija-flor" },
                    c: { resposta: "Tiziu" },
                    d: { resposta: "Quero-Quero" }
                }
            }
        }
    },
    {
        type: 'audio',
        pergunta: "Which bird makes this soft melodic sound?",
        respostas:
        {
            a: {resposta: "Bem-te-vi", correta: false},
            b: {resposta: "Macaw", correta: false},
            c: {resposta: "Sabiá", correta: true},
            d: {resposta: "Seagull", correta: false},
        },
        audioSrc: "../js/piados/sabiapiado.wav",
        imageFile: "sabiá-vetor.png",
        videoId: "cbdLm7vGpqI",
        audioTitle: "Listen to the bird call and choose",
        audioNoteText: "Tap the button to hear the bird sound",
        playButton: "Play sound",
        translations: {
            pt: {
                pergunta: "Qual pássaro faz um piado suave e melodioso?",
                audioTitle: "Ouça o piado e escolha o pássaro",
                audioNoteText: "Toque no botão para ouvir o som do pássaro",
                playButton: "Tocar piado",
                respostas: {
                    a: { resposta: "Bem-te-vi" },
                    b: { resposta: "Arara" },
                    c: { resposta: "Sabiá" },
                    d: { resposta: "Gaivota" }
                }
            }
        }
    },
    {
        type: 'audio',
        pergunta: "Which bird makes this fast repeated call?",
        respostas:
        {
            a: {resposta: "Macaw", correta: false},
            b: {resposta: "Tiziu", correta: true},
            c: {resposta: "Araponga", correta: false},
            d: {resposta: "Curió", correta: false},
        },
        audioSrc: "../js/piados/tiziupiado.wav",
        imageFile: "tiziu-vetor.png",
        videoId: "xkxl0binH0I",
        audioTitle: "Listen to the bird call and choose",
        audioNoteText: "Tap the button to hear the bird sound",
        playButton: "Play sound",
        translations: {
            pt: {
                pergunta: "Qual é o pássaro que tem um chamamento rápido e repetido?",
                audioTitle: "Ouça o piado e escolha o pássaro",
                audioNoteText: "Toque no botão para ouvir o som do pássaro",
                playButton: "Tocar piado",
                respostas: {
                    a: { resposta: "Arara" },
                    b: { resposta: "Tiziu" },
                    c: { resposta: "Araponga" },
                    d: { resposta: "Curió" }
                }
            }
        }
    },
    {
        type: 'audio',
        pergunta: "Which bird makes this deep strong forest sound?",
        respostas:
        {
            a: {resposta: "Araponga", correta: true},
            b: {resposta: "Seagull", correta: false},
            c: {resposta: "Pigeon", correta: false},
            d: {resposta: "Hummingbird", correta: false},
        },
        audioSrc: "../js/piados/arapongapiado.mp3",
        imageFile: "araponga-vetor.png",
        videoId: "zfTYHufyaF4",
        audioTitle: "Listen to the bird call and choose",
        audioNoteText: "Tap the button to hear the bird sound",
        playButton: "Play sound",
        translations: {
            pt: {
                pergunta: "Qual pássaro faz o som grave e forte da floresta?",
                audioTitle: "Ouça o piado e escolha o pássaro",
                audioNoteText: "Toque no botão para ouvir o som do pássaro",
                playButton: "Tocar piado",
                respostas: {
                    a: { resposta: "Araponga" },
                    b: { resposta: "Gaivota" },
                    c: { resposta: "Pombo" },
                    d: { resposta: "Beija-Flor" }
                }
            }
        }
    },
    {
        type: 'audio',
        pergunta: "Which bird makes this clear proud sound?",
        respostas:
        {
            a: {resposta: "Coleiro", correta: false},
            b: {resposta: "Quero-Quero", correta: true},
            c: {resposta: "Papagaio", correta: false},
            d: {resposta: "Tico-Tico", correta: false},
        },
        audioSrc: "../js/piados/queroqueropiado.wav",
        imageFile: "quero-quero-vetor.png",
        videoId: "uqcG-IsYbRk",
        audioTitle: "Listen to the bird call and choose",
        audioNoteText: "Tap the button to hear the bird sound",
        playButton: "Play sound",
        translations: {
            pt: {
                pergunta: "Qual pássaro emite um som claro e orgulhoso?",
                audioTitle: "Ouça o piado e escolha o pássaro",
                audioNoteText: "Toque no botão para ouvir o som do pássaro",
                playButton: "Tocar piado",
                respostas: {
                    a: { resposta: "Coleiro" },
                    b: { resposta: "Quero-Quero" },
                    c: { resposta: "Papagaio" },
                    d: { resposta: "Tico-Tico" }
                }
            }
        }
    },
    {
        type: 'audio',
        pergunta: "Which bird sings in a quick hopping voice?",
        respostas:
        {
            a: {resposta: "Tico-Tico", correta: true},
            b: {resposta: "Sabiá", correta: false},
            c: {resposta: "Bem-te-vi", correta: false},
            d: {resposta: "Araponga", correta: false},
        },
        audioSrc: "../js/piados/ticoticopiado.mp3",
        imageFile: "tico-tico-vetor.png",
        videoId: "VN5UprvbgqQ",
        audioTitle: "Listen to the bird call and choose",
        audioNoteText: "Tap the button to hear the bird sound",
        playButton: "Play sound",
        translations: {
            pt: {
                pergunta: "Qual pássaro canta com voz rápida e saltitante?",
                audioTitle: "Ouça o piado e escolha o pássaro",
                audioNoteText: "Toque no botão para ouvir o som do pássaro",
                playButton: "Tocar piado",
                respostas: {
                    a: { resposta: "Tico-Tico" },
                    b: { resposta: "Sabiá" },
                    c: { resposta: "Bem-te-vi" },
                    d: { resposta: "Araponga" }
                }
            }
        }
    },
    {
        pergunta: "Which bird has the highest song?",
        respostas:
        {
            a: {resposta: "Falcon", correta: false},
            b: {resposta: "Tiziu", correta: false},
            c: {resposta: "Araponga", correta: true},
            d: {resposta: "Vulture", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual o pássaro que tem o canto mais alto?",
                respostas: {
                    a: { resposta: "Falcão" },
                    b: { resposta: "Tizíu" },
                    c: { resposta: "Araponga" },
                    d: { resposta: "Urubu" }
                }
            },
            es: {
                pergunta: "¿Qué pájaro tiene el canto más alto?",
                respostas: {
                    a: { resposta: "Halcón" },
                    b: { resposta: "Tiziu" },
                    c: { resposta: "Araponga" },
                    d: { resposta: "Buitre" }
                }
            },
            fr: {
                pergunta: "Quel oiseau a le chant le plus aigu ?",
                respostas: {
                    a: { resposta: "Faucon" },
                    b: { resposta: "Tiziu" },
                    c: { resposta: "Araponga" },
                    d: { resposta: "Vautour" }
                }
            },
            it: {
                pergunta: "Quale uccello ha il canto più acuto?",
                respostas: {
                    a: { resposta: "Falco" },
                    b: { resposta: "Tiziu" },
                    c: { resposta: "Araponga" },
                    d: { resposta: "Avvoltoio" }
                }
            },
            de: {
                pergunta: "Welcher Vogel hat den höchsten Gesang?",
                respostas: {
                    a: { resposta: "Falke" },
                    b: { resposta: "Tiziu" },
                    c: { resposta: "Araponga" },
                    d: { resposta: "Geier" }
                }
            }
        }
    },
    {
        pergunta: "Which bird flaps its wings the fastest?",
        respostas:
        {
            a: {resposta: "Quero-Quero", correta: false},
            b: {resposta: "Toucan", correta: false},
            c: {resposta: "Macaw", correta: false},
            d: {resposta: "Hummingbird", correta: true},
        },
        translations: {
            pt: {
                pergunta: "Qual o pássaro que bate as asas mais rápido?",
                respostas: {
                    a: { resposta: "Quero-Quero" },
                    b: { resposta: "Tucano" },
                    c: { resposta: "Arara" },
                    d: { resposta: "Beija-Flor" }
                }
            },
            es: {
                pergunta: "¿Qué pájaro bate sus alas más rápido?",
                respostas: {
                    a: { resposta: "Quero-Quero" },
                    b: { resposta: "Tucán" },
                    c: { resposta: "Guacamayo" },
                    d: { resposta: "Colibrí" }
                }
            },
            fr: {
                pergunta: "Quel oiseau bat des ailes le plus vite ?",
                respostas: {
                    a: { resposta: "Quero-Quero" },
                    b: { resposta: "Toucan" },
                    c: { resposta: "Ara" },
                    d: { resposta: "Colibri" }
                }
            },
            it: {
                pergunta: "Quale uccello sbatte le ali più velocemente?",
                respostas: {
                    a: { resposta: "Quero-Quero" },
                    b: { resposta: "Tucano" },
                    c: { resposta: "Ara" },
                    d: { resposta: "Colibrì" }
                }
            },
            de: {
                pergunta: "Welcher Vogel schlägt am schnellsten mit den Flügeln?",
                respostas: {
                    a: { resposta: "Quero-Quero" },
                    b: { resposta: "Tukan" },
                    c: { resposta: "Ara" },
                    d: { resposta: "Kolibri" }
                }
            }
        }
    },
    {
        pergunta: "Which bird is famous for its beautiful song?",
        respostas:
        {
            a: {resposta: "Seagull", correta: false},
            b: {resposta: "Anu-Preto", correta: false},
            c: {resposta: "Curió", correta: true},
            d: {resposta: "Sparrow", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual o pássaro que é famoso pelo seu canto bonito?",
                respostas: {
                    a: { resposta: "Gaivota" },
                    b: { resposta: "Anu-Preto" },
                    c: { resposta: "Curió" },
                    d: { resposta: "Tico-Tico" }
                }
            },
            es: {
                pergunta: "¿Qué pájaro es famoso por su bonito canto?",
                respostas: {
                    a: { resposta: "Gaviota" },
                    b: { resposta: "Anu-Preto" },
                    c: { resposta: "Curió" },
                    d: { resposta: "Gorrión" }
                }
            },
            fr: {
                pergunta: "Quel oiseau est célèbre pour son beau chant ?",
                respostas: {
                    a: { resposta: "Mouette" },
                    b: { resposta: "Anu-Preto" },
                    c: { resposta: "Curió" },
                    d: { resposta: "Moineau" }
                }
            },
            it: {
                pergunta: "Quale uccello è famoso per il suo bel canto?",
                respostas: {
                    a: { resposta: "Gabbiano" },
                    b: { resposta: "Anu-Preto" },
                    c: { resposta: "Curió" },
                    d: { resposta: "Passero" }
                }
            },
            de: {
                pergunta: "Welcher Vogel ist berühmt für seinen schönen Gesang?",
                respostas: {
                    a: { resposta: "Möwe" },
                    b: { resposta: "Anu-Preto" },
                    c: { resposta: "Curió" },
                    d: { resposta: "Spatz" }
                }
            }
        }
    },
    {
        pergunta: "Which bird loves lakes and rivers?",
        respostas:
        {
            a: {resposta: "Rolinha", correta: false},
            b: {resposta: "Pigeon", correta: false},
            c: {resposta: "Cowbird", correta: false},
            d: {resposta: "Kingfisher", correta: true},
        },
        translations: {
            pt: {
                pergunta: "Qual o pássaro que adora lagos e rios?",
                respostas: {
                    a: { resposta: "Rolinha" },
                    b: { resposta: "Pombo" },
                    c: { resposta: "Chupim" },
                    d: { resposta: "Martim-Pescador" }
                }
            },
            es: {
                pergunta: "¿Qué pájaro adora lagos y ríos?",
                respostas: {
                    a: { resposta: "Rolinha" },
                    b: { resposta: "Paloma" },
                    c: { resposta: "Tórtola" },
                    d: { resposta: "Martín Pescador" }
                }
            },
            fr: {
                pergunta: "Quel oiseau adore les lacs et les rivières ?",
                respostas: {
                    a: { resposta: "Rolinha" },
                    b: { resposta: "Pigeon" },
                    c: { resposta: "Tordo" },
                    d: { resposta: "Martin-pêcheur" }
                }
            },
            it: {
                pergunta: "Quale uccello ama laghi e fiumi?",
                respostas: {
                    a: { resposta: "Rolinha" },
                    b: { resposta: "Colombo" },
                    c: { resposta: "Tordo" },
                    d: { resposta: "Martin pescatore" }
                }
            },
            de: {
                pergunta: "Welcher Vogel liebt Seen und Flüsse?",
                respostas: {
                    a: { resposta: "Rolinha" },
                    b: { resposta: "Taube" },
                    c: { resposta: "Stieglitz" },
                    d: { resposta: "Eisvogel" }
                }
            }
        }
    },
]