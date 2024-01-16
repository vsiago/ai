const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');

// Verifica se o acesso à webcam é suportado
function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }
  
  // Se houver suporte para webcam, adicione ouvinte de evento ao botão para quando o usuário
  // deseja ativá-lo para chamar a função enableCam que iremos
  // defina na próxima etapa.
  if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }
  
// Habilite a visualização da webcam ao vivo e inicie a classificação.
function enableCam(event) {
// Continue apenas se o COCO-SSD terminar de carregar.
    if (!model) {
      return;
    }
    
    // Oculta o botão uma vez clicado.
    event.target.classList.add('removed');  
    
    // parâmetros getUsermedia para forçar vídeo, mas não áudio.
    const constraints = {
      video: true
    };

        // Verificação de dispositivo móvel
        if (window.innerWidth <= 768) {
            constraints.video = {
                width: { ideal: window.innerWidth },
                height: { ideal: window.innerHeight }
            };
        }
  
    // Ative o fluxo da webcam
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      video.srcObject = stream;
      video.addEventListener('loadeddata', predictWebcam);
    });
  }

  // Após a definição da função enableCam
window.addEventListener('resize', function () {
    if (window.innerWidth <= 768) {
        video.style.width = window.innerWidth + 'px';
        video.style.height = window.innerHeight + 'px';
    } else {
        video.style.width = '100vw';
        video.style.height = '100vh';
    }
});


// Finja que o modelo foi carregado para que possamos testar o código da webcam.
var model = true;
demosSection.classList.remove('invisible');

// Armazene o modelo resultante no escopo global do nosso aplicativo.
var model = undefined;

// Antes de podermos usar a classe COCO-SSD devemos esperar que ela termine
// carregando. Os modelos de aprendizado de máquina podem ser grandes e demorar um pouco
// para obter tudo o que é necessário para funcionar.
// Nota: cocoSsd é um objeto externo carregado de nosso index.html
// importação de tag de script, então ignore qualquer aviso no Glitch.
cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
  // Mostre a seção de demonstração agora que o modelo está pronto para uso.
  demosSection.classList.remove('invisible');
});


var children = [];

function predictWebcam() {
  // Agora vamos começar a classificar um quadro no stream
  model.detect(video).then(function (predictions) {
    // Remova qualquer destaque que fizemos no quadro anterior.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);
    
    // Agora vamos percorrer as previsões e desenhá-las para a visualização ao vivo se
    // eles têm uma pontuação de confiança alta.
    for (let n = 0; n < predictions.length; n++) {
      // Se tivermos mais de 66% de certeza de que classificamos corretamente, desenhe!
      if (predictions[n].score > 0.66) {
        const p = document.createElement('p');
        p.innerText = predictions[n].class  + ' - with ' 
            + Math.round(parseFloat(predictions[n].score) * 100) 
            + '% confidence.';
        p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
            + (predictions[n].bbox[1] - 10) + 'px; width: ' 
            + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
            + predictions[n].bbox[1] + 'px; width: ' 
            + predictions[n].bbox[2] + 'px; height: '
            + predictions[n].bbox[3] + 'px;';

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }
    
    // Chame essa função novamente para continuar prevendo quando o navegador estiver pronto.
    window.requestAnimationFrame(predictWebcam);
  });
}