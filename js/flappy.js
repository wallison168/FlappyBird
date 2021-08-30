function novoElement(tagName, className){ // função responsavel por criar um novo elemento html
    const element = document.createElement(tagName)
    element.className = className
    return element
}

function Barreira(reverse = false){
    this.elemento = novoElement('div', 'barreira') // criando uma tag html nocaso a tag "div" e atribuindo a essa tag uma classe "barreira"

    const borda = novoElement('div', 'borda')
    const corpo = novoElement('div', 'corpo')

    this.elemento.appendChild(reverse ? corpo : borda) // definindo a formatação da tag ou seja caso ela fica na parte de cima recebra um tipo de formatação caso fique na parte de baixo recebera outra formatação
    this.elemento.appendChild(reverse ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

function ParDEBarreiras(altura, abertura, x){
    this.elemento = novoElement('div', 'par-de-barreiras')

    this.superior = new Barreira(true) // definindo o elemento na parte superior da pagina
    this.inferior = new Barreira(false) // definindo o elemento na parte inferior da pagina

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)
    
    this.randonAbertura = () => { // Essa função tem o proposito de realizar uma calculo randomico para definir o tamanho dos elemenos e suas posições aleatoriamente
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior

        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.randonAbertura()
    this.setX(x)
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto){ // Basicamente essa função define as barreiras no jogo e suas posições
    this.pares = [
        new ParDEBarreiras(altura, abertura, largura),
        new ParDEBarreiras(altura, abertura, largura + espaco),
        new ParDEBarreiras(altura, abertura, largura + espaco * 2),
        new ParDEBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3

    this.animar = () => { // funções que defini a animação por dentro do jogo 
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // quando a barreira sair da area definida do jogo iremos fazer o reuso dela novamente

            if (par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)
                par.randonAbertura()
            }

            const meio = largura / 2
            const cruzouMeio = par.getX() + deslocamento >= meio && par.getX() < meio
           
            if(cruzouMeio){
                notificarPonto()
            }
        })
    }
}

function Passaro(alturaJogo){ // função que inseri o pasasro dentro do jogo e defini a suas funcionalidades 
    let voando = false

    this.elemento = novoElement('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clienteHeight

        if(novoY <= 0){
            this.setY(0)
        }
        else if (novoY >= alturaMaxima){
            this.setY(alturaMaxima)
        }
        else{
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}

function Progresso() { // função que define o progresso do jogador dentro do game 
    this.elemento = novoElement('span', 'progresso')

    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos()
}

function estaoSobrePosto(elementoA, elementoB) { // função define se os elemento estão no mesmo local da pagina

    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function colider(passaro, barreiras){ // função realiza o efeito de colizão 
    let  colider = false

    barreiras.pares.forEach(parDeBarreiras => {
        if(!colider){
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento

            colider = estaoSobrePosto(passaro.elemento, superior) || estaoSobrePosto(passaro.elemento, inferior)
        }
    })

    return colider
}

function FlappyBird(){ // função index ou seja essa função ira inicializar o jogo 
    let pontos = 0

    const areaGame = document.querySelector('[wm-flappy]')
    const altura = areaGame.clientHeight
    const largura = areaGame.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaGame.appendChild(progresso.elemento)
    areaGame.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaGame.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colider(passaro, barreiras)){
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyBird().start() // chamando a função start para inicializar o jogo


