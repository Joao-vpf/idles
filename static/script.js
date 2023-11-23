var vida = 7;

var x;
if (x===undefined)
{ 
    fetch('/get_data')
    .then(response => response.json())
    .then(data => {
        x= data.data;
    })
}

var last_block = -1; 

document.addEventListener('keydown', (event) => {
    block = event.target;
    console.log(document.activeElement);
    if (last_block !== -1 && ((event.key === 'Backspace' &&  document.activeElement.tagName !== 'INPUT')|| event.key ===  'ArrowLeft' || event.key === 'Enter'))
    {
        block = last_block;
        last_block = -1;
    }


    if (!block.classList.contains('input-block')) {
        return;
    }

    const blocks = Array.from(block.parentNode.children);
    const index = blocks.indexOf(block);
    const key = event.key;

    switch (key) {
        case 'Enter':
            checkWord(blocks);
            break;
        case 'Backspace':
            if (blocks[index].textContent === "" && index > 0)
            {
                blocks[index-1].focus();
                blocks[index-1].textContent = "";
            }
            else
            {
                blocks[index].focus();
                blocks[index].textContent = "";
            }
            break;
        case 'ArrowLeft':
            if (index > 0) {
                blocks[index - 1].focus();
            }
            break;
        case 'ArrowRight':
            if (index < blocks.length - 1) {
                blocks[index + 1].focus();
            }
            break;
        default:
            if (key.length === 1 && key.match(/[a-z]/i)) {
                blocks[index].textContent = key.toUpperCase();
                blocks[index].classList.add('grow'); 
                if (index < blocks.length - 1) {
                    blocks[index + 1].focus();
                } 
                else 
                {
                    last_block = blocks[index];
                    blocks[index].blur();
                }
                blocks[index].addEventListener('animationend', function() {
                    this.classList.remove('grow');
                });
                
            }
    }
    

    event.preventDefault();
});

function checkWord(blocks) {
    const word = blocks.map(block => block.textContent).join('');
    if (word.length === 5) 
    {
        fetch('/check_word', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                word: word,
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.data)
            if(data.data === 1)
            {
                removealert();
                if (word === x) 
                {
                    animateBlocks(blocks);
                } 
                else 
                {
                    removeheart();
                    vida -= 1;
                    handleWrongWord(blocks);
                }            
            }
            else
            {
                customAlert("Não existe essa palavra no banco de dados.")
            }
        })
        .catch(error => {
            console.error('Erro ao verificar a palavra:', error);
        });

    }
}

function animateBlocks(blocks) {
    blocks.forEach((block, index) => {
        setTimeout(() => { 
            block.contentEditable = false; 
            block.style.transition = 'background-color 0.1s ease';
            block.style.backgroundColor = 'rgb(0, 164, 113)';
            block.classList.add('onda');
        }, index * 40); 
    });
}

function removeheart()
{
    var heart = document.getElementById('heart' + vida);
    heart.parentNode.removeChild(heart);
}

function handleWrongWord(blocks) {
    blocks.forEach(block => {
        block.contentEditable = false;
        if(block.textContent === x[parseInt(block.id)-1]) 
        {   
            block.style.backgroundColor = 'rgb(0, 164, 113)';
        }
    });
    
    blocks.forEach(block => {
        if(x.includes(block.textContent)) 
        {
            const countInX = Array.from(x).filter(letter => letter === block.textContent).length;
            const countInBlocks = Array.from(blocks).filter(b => b.textContent === block.textContent && (window.getComputedStyle(b).backgroundColor === 'rgb(249, 244, 148)' || window.getComputedStyle(b).backgroundColor === 'rgb(0, 164, 113)')).length;
           

            if(countInBlocks < countInX && window.getComputedStyle(block).backgroundColor === 'rgba(0, 95, 107, 0.3)') 
            {
                block.classList.add('yshake');
                block.style.backgroundColor = 'rgb(249, 244, 148)';
            }
            else
            {
                if(window.getComputedStyle(block).backgroundColor === 'rgba(0, 95, 107, 0.3)')
                {
                    block.classList.add('rshake');
                    block.style.transition = 'background-color 0.5s ease';
                    block.style.backgroundColor = 'rgb(232, 127, 127)'; 
                }
            }
        }
        else
        {
            if(window.getComputedStyle(block).backgroundColor === 'rgba(0, 95, 107, 0.3)')
            {
                block.classList.add('rshake');
                block.style.transition = 'background-color 0.5s ease';
                block.style.backgroundColor = 'rgb(232, 127, 127)'; 
            }
        }
    });

    if (vida > 0) {
        createNewContainer();
    }
    else
    {
        customAlert("A palavra era: " + x)
    }
}


function removealert()
{
    var alertBox = document.getElementById('alert1');
    alertBox.style.opacity = "0";
}

function customAlert(msg) {
    // Cria um novo elemento div
    var alertBox = document.getElementById('alert1');
    
    alertBox.style.opacity = "1";

    // Define o texto do alerta
    alertBox.textContent = msg;

}


function createNewContainer() {
    const newContainer = document.createElement('div');
    newContainer.className = 'blocks-container';
    for(let i=1; i<=5; i++){
        const newBlock = document.createElement('div');
        newBlock.className = 'input-block';
        newBlock.id = `${i}`;
        newBlock.contentEditable = true;
        newContainer.appendChild(newBlock);
    }
    document.body.appendChild(newContainer);
    newContainer.children[0].focus();
}

document.addEventListener('click', (event) => {
    const block = event.target;
    if (block.classList.contains('input-block') && block.getAttribute('contentEditable') === 'false') {
        event.preventDefault();
    }
});

document.addEventListener('copy', (event) => {
    event.preventDefault();
});

document.addEventListener('paste', (event) => {
    event.preventDefault();
});

document.addEventListener('cut', (event) => {
    event.preventDefault();
});


/* login */

document.addEventListener("DOMContentLoaded", function () {
    var loginIcon = document.getElementById("perfilIcon");
    var loginMenu = document.getElementById("perfilMenu");

    loginIcon.addEventListener("click", function () {
		if (loginMenu.style.display==="block" ) 
		{
            loginMenu.style.display = "none";
        }
        else
        {
			loginMenu.style.display = "block";
		}
    });
});


// Adiciona eventos aos botões
// document.getElementById('historicoButton').addEventListener('click',  hist);
document.getElementById("loginButton").addEventListener("click", login);

async function login(event) 
{
    event.preventDefault(); 
    
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;


    await fetch('/get_login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if(data.data == 1)
        {
            conf_login(username);
        }
        else
        {
            alert('Login falhou. Verifique suas credenciais.');
        }
    })
    .catch(error => {
        console.error('Erro ao enviar a solicitação:', error);
    });
   
}

document.getElementById("criarContaButton").addEventListener("click", criarConta);
async function criarConta(event)
{
    event.preventDefault(); 
	//alterar aqui
   await fetch('/get_login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if(data.data === 1)
        {
            conf_login(username);
        }
        else
        {
            alert('Login falhou. Verifique suas credenciais.');
        }
    })
    .catch(error => {
        console.error('Erro ao enviar a solicitação:', error);
    });
}

async function conf_login(username)
{
    document.getElementById('username_perfil').textContent = username;
    document.getElementById('loginBlock').remove();
    document.getElementById('perfilBlock').style.display = 'block';

    switch(username)
    {
        case "napoleao":
            onYouTubeIframeAPIReady(true);
            break;
        default:
            break;
    }

}


document.getElementById('configuracoesButton').addEventListener('click', config);
async function config(event)
{
    event.preventDefault(); 
    if(document.getElementById('infoperfil').style.display === 'block')
    {
		document.getElementById('infoperfil').style.display = 'none';
	}
	else
	{
		document.getElementById('infoperfil').style.display = 'block';
	}
		
}


/* easter eggs */

function onYouTubeIframeAPIReady(ok) {
    if (ok === true)
    {
        var playerContainer = document.getElementById('player-container');

        var player = new YT.Player('player', {
            height: '315',
            width: '560',
            videoId: 'bxaPQykTUck', 
            events: {
                'onReady': function (event) {
                    event.target.playVideo();

                    playerContainer.style.display = 'flex';
                },
                'onStateChange': function (event) {
                    console.log('Estado do Player:', event.data);
                    if(event.data !== 3 && event.data!==-1 && event.data!==1)
                    {
                        playerContainer.remove();
                    }
                }
            }
        });
    }
}
