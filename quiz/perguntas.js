const perguntas = 
[
    {
        type: 'texto',
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
        pergunta: "Which bird makes this sound?",
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
                pergunta: "Qual pássaro é este som?",
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
        pergunta: "Which bird makes this sound?",
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
                pergunta: "Qual pássaro é este som?",
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
        pergunta: "Which bird makes this sound?",
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
                pergunta: "Qual pássaro é este som?",
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
        pergunta: "Which bird makes this sound?",
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
                pergunta: "Qual pássaro é este som?",
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
        pergunta: "Which bird makes this sound?",
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
                pergunta: "Qual pássaro é este som?",
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
        type: 'texto',
        pergunta: "Which bird sings in a quick hopping sound?",
        respostas:
        {
            a: {resposta: "Tico-Tico", correta: true},
            b: {resposta: "Sabiá", correta: false},
            c: {resposta: "Bem-te-vi", correta: false},
            d: {resposta: "Araponga", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual pássaro canta com voz rápida e saltitante?",
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
        type: 'texto',
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
        type: 'texto',
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
        type: 'texto',
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
        type: 'texto',
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
    {
        type: 'texto',
        pergunta: "Which bird's song became famous worldwide because of a song written about it?",
        respostas:
        {
            a: {resposta: "Tico-Tico", correta: true},
            b: {resposta: "Sabiá", correta: false},
            c: {resposta: "Araponga", correta: false},
            d: {resposta: "Curió", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual pássaro cuja música ficou conhecida no mundo inteiro por ter uma canção que fala dele?",
                respostas: {
                    a: { resposta: "Tico-Tico" },
                    b: { resposta: "Sabiá" },
                    c: { resposta: "Araponga" },
                    d: { resposta: "Curió" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which bird likes rivers and gets its food from there?",
        respostas:
        {
            a: {resposta: "Sabiá", correta: false},
            b: {resposta: "Kingfisher", correta: true},
            c: {resposta: "Pigeon", correta: false},
            d: {resposta: "Tico-Tico", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual pássaro gosta de rios e tira o alimento de lá?",
                respostas: {
                    a: { resposta: "Sabiá" },
                    b: { resposta: "Martim-Pescador" },
                    c: { resposta: "Pombo" },
                    d: { resposta: "Tico-Tico" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which song has the melody most appreciated by Brazilians?",
        respostas:
        {
            a: {resposta: "Seagull", correta: false},
            b: {resposta: "Curió", correta: true},
            c: {resposta: "Anu-Preto", correta: false},
            d: {resposta: "Sparrow", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual canto tem a melodia mais apreciada pelo brasileiro?",
                respostas: {
                    a: { resposta: "Gaivota" },
                    b: { resposta: "Curió" },
                    c: { resposta: "Anu-Preto" },
                    d: { resposta: "Tico-Tico" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which bird saves people, has a yellow chest, and is seen in every city across Brazil?",
        respostas:
        {
            a: {resposta: "Sabiá", correta: false},
            b: {resposta: "Bem-te-vi", correta: true},
            c: {resposta: "Araponga", correta: false},
            d: {resposta: "Tico-Tico", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual o pássaro que salva as pessoas, tem o peito amarelo e é visto em todo o Brasil, em todas as cidades?",
                respostas: {
                    a: { resposta: "Sabiá" },
                    b: { resposta: "Bem-te-vi" },
                    c: { resposta: "Araponga" },
                    d: { resposta: "Tico-Tico" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which is the largest Brazilian bird?",
        respostas:
        {
            a: {resposta: "Ema", correta: true},
            b: {resposta: "Harpia", correta: false},
            c: {resposta: "Jacurutu", correta: false},
            d: {resposta: "Falcão-peregrino", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual é a maior ave brasileira?",
                respostas: {
                    a: { resposta: "Ema" },
                    b: { resposta: "Harpia" },
                    c: { resposta: "Jacurutu" },
                    d: { resposta: "Falcão-peregrino" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which bird is considered, by law, the national bird of Brazil?",
        respostas:
        {
            a: {resposta: "Sabiá-laranjeira", correta: true},
            b: {resposta: "Bem-te-vi", correta: false},
            c: {resposta: "Curió", correta: false},
            d: {resposta: "Tico-Tico", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual ave é considerada, por lei, a ave símbolo do Brasil?",
                respostas: {
                    a: { resposta: "Sabiá-laranjeira" },
                    b: { resposta: "Bem-te-vi" },
                    c: { resposta: "Curió" },
                    d: { resposta: "Tico-Tico" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which bird can hover in place by beating its wings dozens of times per second?",
        respostas:
        {
            a: {resposta: "Beija-flor", correta: true},
            b: {resposta: "Andorinha", correta: false},
            c: {resposta: "Martim-Pescador", correta: false},
            d: {resposta: "Tico-Tico", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual ave consegue pairar no ar batendo as asas dezenas de vezes por segundo?",
                respostas: {
                    a: { resposta: "Beija-flor" },
                    b: { resposta: "Andorinha" },
                    c: { resposta: "Martim-Pescador" },
                    d: { resposta: "Tico-Tico" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which bird has a large beak that helps it reach fruit and regulate its body temperature?",
        respostas:
        {
            a: {resposta: "Tucano", correta: true},
            b: {resposta: "Arara-canindé", correta: false},
            c: {resposta: "Carcará", correta: false},
            d: {resposta: "Urubu", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual ave tem um bico grande que ajuda a alcançar frutas e regular a temperatura do corpo?",
                respostas: {
                    a: { resposta: "Tucano" },
                    b: { resposta: "Arara-canindé" },
                    c: { resposta: "Carcará" },
                    d: { resposta: "Urubu" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which bird is known for imitating sounds and human speech?",
        respostas:
        {
            a: {resposta: "Papagaio", correta: true},
            b: {resposta: "Sabiá", correta: false},
            c: {resposta: "Curió", correta: false},
            d: {resposta: "Bem-te-vi", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual ave é conhecida por imitar sons e a fala humana?",
                respostas: {
                    a: { resposta: "Papagaio" },
                    b: { resposta: "Sabiá" },
                    c: { resposta: "Curió" },
                    d: { resposta: "Bem-te-vi" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which bird is often seen following cattle to catch the insects they stir up?",
        respostas:
        {
            a: {resposta: "Garça-branca", correta: true},
            b: {resposta: "Seriema", correta: false},
            c: {resposta: "Quero-quero", correta: false},
            d: {resposta: "Anu-branco", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual ave costuma ser vista acompanhando o gado para capturar os insetos que ele espanta?",
                respostas: {
                    a: { resposta: "Garça-branca" },
                    b: { resposta: "Seriema" },
                    c: { resposta: "Quero-quero" },
                    d: { resposta: "Anu-branco" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which bird is considered the symbol of the Pantanal?",
        respostas:
        {
            a: {resposta: "Tuiuiú", correta: true},
            b: {resposta: "Garça-branca", correta: false},
            c: {resposta: "Carcará", correta: false},
            d: {resposta: "Seriema", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual ave é considerada o símbolo do Pantanal?",
                respostas: {
                    a: { resposta: "Tuiuiú" },
                    b: { resposta: "Garça-branca" },
                    c: { resposta: "Carcará" },
                    d: { resposta: "Seriema" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which bird is commonly seen in backyards and urban areas with fruit trees?",
        respostas:
        {
            a: {resposta: "Sanhaço", correta: true},
            b: {resposta: "Anu-branco", correta: false},
            c: {resposta: "Bem-te-vi", correta: false},
            d: {resposta: "Rolinha", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual ave é comumente vista em quintais e áreas urbanas com árvores frutíferas?",
                respostas: {
                    a: { resposta: "Sanhaço" },
                    b: { resposta: "Anu-branco" },
                    c: { resposta: "Bem-te-vi" },
                    d: { resposta: "Rolinha" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which bird of prey commonly hunts small rodents, reptiles, and insects across Brazil?",
        respostas:
        {
            a: {resposta: "Gavião-carijó", correta: true},
            b: {resposta: "Coruja-buraqueira", correta: false},
            c: {resposta: "Urubu", correta: false},
            d: {resposta: "Carcará", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual ave de rapina costuma caçar pequenos roedores, répteis e insetos pelo Brasil?",
                respostas: {
                    a: { resposta: "Gavião-carijó" },
                    b: { resposta: "Coruja-buraqueira" },
                    c: { resposta: "Urubu" },
                    d: { resposta: "Carcará" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which bird is commonly associated, across cultures, with the symbol of peace?",
        respostas:
        {
            a: {resposta: "Rolinha", correta: true},
            b: {resposta: "Quero-quero", correta: false},
            c: {resposta: "Anu-branco", correta: false},
            d: {resposta: "Sanhaço", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual ave é comumente associada, em diversas culturas, ao símbolo da paz?",
                respostas: {
                    a: { resposta: "Rolinha" },
                    b: { resposta: "Quero-quero" },
                    c: { resposta: "Anu-branco" },
                    d: { resposta: "Sanhaço" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which is the only Brazilian bird considered 'the mason' that builds its house in a spiral, in layers of clay?",
        respostas:
        {
            a: {resposta: "Maritaca", correta: false},
            b: {resposta: "João-de-Barro", correta: true},
            c: {resposta: "Cambaxirra", correta: false},
            d: {resposta: "Maria-Lencinha", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual o único pássaro brasileiro que é considerado o pedreiro e constrói sua casa em espiral em camadas de argila?",
                respostas: {
                    a: { resposta: "Maritaca" },
                    b: { resposta: "João-de-Barro" },
                    c: { resposta: "Cambaxirra" },
                    d: { resposta: "Maria-Lencinha" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which is the smallest bird in Brazil, living in the Amazon rainforest?",
        respostas:
        {
            a: {resposta: "Beija-Flor", correta: false},
            b: {resposta: "Bico-de-Lacre", correta: false},
            c: {resposta: "Caçula", correta: true},
            d: {resposta: "Tiziu", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual o menor pássaro do Brasil e que vive na floresta Amazônica?",
                respostas: {
                    a: { resposta: "Beija-Flor" },
                    b: { resposta: "Bico-de-Lacre" },
                    c: { resposta: "Caçula" },
                    d: { resposta: "Tiziu" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which is the only bird that jumps in the air and sings at the same time?",
        respostas:
        {
            a: {resposta: "Gaturamo", correta: false},
            b: {resposta: "Pica-Pau", correta: false},
            c: {resposta: "Coleiro", correta: false},
            d: {resposta: "Tiziu", correta: true},
        },
        translations: {
            pt: {
                pergunta: "Qual o único pássaro que salta no ar e canta ao mesmo tempo?",
                respostas: {
                    a: { resposta: "Gaturamo" },
                    b: { resposta: "Pica-Pau" },
                    c: { resposta: "Coleiro" },
                    d: { resposta: "Tiziu" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which bird visits garden fruit trees and whistles high-pitched, like a sharp violin?",
        respostas:
        {
            a: {resposta: "Sanhaço", correta: true},
            b: {resposta: "Sabiá", correta: false},
            c: {resposta: "Papagaio", correta: false},
            d: {resposta: "Beija-Flor", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual o pássaro que, além de visitar as fruteiras dos quintais, assobia muito fino como um violino agudo?",
                respostas: {
                    a: { resposta: "Sanhaço" },
                    b: { resposta: "Sabiá" },
                    c: { resposta: "Papagaio" },
                    d: { resposta: "Beija-Flor" }
                }
            }
        }
    },
    {
        type: 'texto',
        pergunta: "Which bird is known as 'the statue bird', staying completely still at night near sugarcane fields and gates while hunting insects?",
        respostas:
        {
            a: {resposta: "Coruja", correta: false},
            b: {resposta: "Bacurau", correta: true},
            c: {resposta: "Urubu", correta: false},
            d: {resposta: "Quero-quero", correta: false},
        },
        translations: {
            pt: {
                pergunta: "Qual ave é conhecida como o pássaro-estátua, ficando totalmente parada à noite perto de canaviais e até em cancelas, caçando insetos?",
                respostas: {
                    a: { resposta: "Coruja" },
                    b: { resposta: "Bacurau" },
                    c: { resposta: "Urubu" },
                    d: { resposta: "Quero-quero" }
                }
            }
        }
    },
]