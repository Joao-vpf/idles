
var vida = 7;


window.onload = function() {
    var username = localStorage.getItem('username');
    if (username) 
    {
        conf_login(username);
    }
}

var x;
if (x===undefined)
{ 
    fetch('/get_data')
    .then(response => response.json())
    .then(data => {
        x= data.data;
    });
}


var last_block = -1; 

document.addEventListener('keydown', (event) => {
    block = event.target;
    if (last_block !== -1 && ((event.key === 'Backspace' &&  document.activeElement.tagName !== 'INPUT')|| event.key ===  'ArrowLeft' || (event.key === 'Enter' &&  document.activeElement.tagName !== 'INPUT')))
    {
        block = last_block;
        last_block = -1;
    }

    if((event.key === 'Enter' &&  document.activeElement.tagName === 'INPUT'))
    { 
        var currentDiv = document.activeElement.closest('div');

        var inputElements = Array.from(currentDiv.querySelectorAll('input'));

        var currentIndex = inputElements.indexOf(document.activeElement);

        var nextIndex = currentIndex + 1;

        if (nextIndex === inputElements.length) 
        {
            switch (currentDiv.id)
            {
                case "loginBlock":
                    login({ preventDefault: () => {} });
                    return 0;
                case "criarcontaBlock":  
                    confirmarcriarconta({ preventDefault: () => {} });
                    return 0;
                default:
                    return -1;
            }
        }

        inputElements[nextIndex].focus();

        return 0;
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
            adicionar_letra_bloco(3, block.textContent);
        }, index * 40); 
    });
    adicionar_letra_bloco(4, "");
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
            adicionar_letra_bloco(3, block.textContent);
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
                adicionar_letra_bloco(2, block.textContent);
            }
            else
            {
                if(window.getComputedStyle(block).backgroundColor === 'rgba(0, 95, 107, 0.3)')
                {
                    block.classList.add('rshake');
                    block.style.transition = 'background-color 0.5s ease';
                    block.style.backgroundColor = 'rgb(232, 127, 127)'; 
                    adicionar_letra_bloco(1, block.textContent);
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
                adicionar_letra_bloco(1, block.textContent);
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

function adicionar_letra_bloco(tipo, letra) 
{
    var h;

    if (tipo === 1) 
    {
        h = document.querySelector('.letras_des');
    } else if (tipo === 2) 
    {
        h = document.querySelector('.letras_enc');
        if (document.querySelector('.letras_cer').textContent.includes(letra))
         {
            return -1;
        }
    } else if (tipo === 3) {
        h = document.querySelector('.letras_cer');
        if (document.querySelector('.letras_enc').textContent.includes(letra)) 
        {
            var letrasEncArray = document.querySelector('.letras_enc').textContent.split(', ');
            var indexEnc = letrasEncArray.indexOf(letra);
            if (indexEnc !== -1) {
                letrasEncArray.splice(indexEnc, 1);
                document.querySelector('.letras_enc').textContent = letrasEncArray.join(', ').slice(1);
            }
        }
    } else {
        h = document.querySelector('.letras_des');
        h.textContent = ""; 
        return -1;
    }

    var conteudoAtual = h.textContent;

    var letrasArray = conteudoAtual.split(', ');

    if (letrasArray.includes(letra) || document.querySelector('.letras_enc').textContent.includes(letra) || document.querySelector('.letras_cer').textContent.includes(letra)) {
        console.log("Esta letra já está em um tipo diferente.");
        return -1;
    }

    letrasArray.push(letra);

    letrasArray = [...new Set(letrasArray)];

    letrasArray.sort();

    h.textContent = letrasArray.join(', ').slice(1);

    return 1;
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
    for (let i = 1; i <= 5; i++) {
        const newBlock = document.createElement('div');
        newBlock.className = 'input-block';
        newBlock.id = `${i}`;
        newBlock.contentEditable = true;
        newContainer.appendChild(newBlock);
    }
    
    const mainDiv = document.querySelector('.all_blocks');
    mainDiv.appendChild(newContainer.cloneNode(true));

    mainDiv.lastElementChild.children[0].focus();
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

document.getElementById('perfilIcon').addEventListener("click", abrirmenulogin)

async function abrirmenulogin()
{
    var loginMenu = document.getElementById("perfilMenu");
    if (loginMenu.style.display==="flex" ) 
    {
        loginMenu.style.display = "none";
    }
    else
    {
        loginMenu.style.display = "flex";
    }
}


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
        if(data.data === 1)
        {
            localStorage.setItem('username', username);
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
    document.getElementById('perfilBlock').style.display = 'flex';

    switch(username)
    {
        case "napoleao":
            onYouTubeIframeAPIReady(true);
            break;
        default:
            break;
    }

}


/* Criar conta */


document.getElementById("criarContaButton").addEventListener("click", criarConta);

async function criarConta(event)
{
    event.preventDefault(); 
    
	document.getElementById('criarcontaBlock').style.display = 'block';
    document.getElementById('loginBlock').style.display = 'none';
}


document.getElementById("voltarcriar").addEventListener("click", voltarcriar);

async function voltarcriar(event)
{
    event.preventDefault(); 
    
	document.getElementById('criarcontaBlock').style.display ='none';
    document.getElementById('loginBlock').style.display =  'block';
}





document.getElementById('confirmarcriar').addEventListener('click', confirmarcriarconta);
async function confirmarcriarconta(event)
{
    event.preventDefault(); 
    const username = document.getElementById("usernamecriarconta").value;
    const password = document.getElementById("passwordcriarconta").value;
    const passwordrep = document.getElementById("passwordcriarcontarep").value;
    
    document.getElementById("usernamecriarconta").value ="";
    document.getElementById("passwordcriarconta").value ="";
    document.getElementById("passwordcriarcontarep").value ="";

    var aux = username.replace(/\s/, '');
    if(aux=="")
    {
        alert('Usuario deve ter algum caractere além do espaço.');
        return -1;
    }

    if(password !== passwordrep)
    {
        alert('Senhas não estao iguais. Verifique novamente.');
        return -1;
    }

    if(password.length < 6)
    {
        alert('A senha deve ter mais que 6 caracteres.');
        return -1;
        
    }
   

    await fetch('/set_conta', {
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
        if(data.data === -1)
        {
            alert('Nome de usario já existente.');
        }
        else
        {
            alert('Cadastro concluido com sucesso.');
            voltarcriar({ preventDefault: () => {} });
        }
    })
    .catch(error => {
        console.error('Erro ao enviar a solicitação:', error);
    });
}



/* POS LOGIN*/


document.getElementById('configuracoesButton').addEventListener('click', config);
async function config(event)
{
    event.preventDefault(); 
    if(document.getElementById('infoperfil').style.display === 'flex')
    {
		document.getElementById('infoperfil').style.display = 'none';
	}
	else
	{
		document.getElementById('infoperfil').style.display = 'flex';
	}
		
}


document.addEventListener('click', function (event) {
    //fecha abas menu e infoperfil
    const configuracoesButton = document.getElementById('configuracoesButton');
    const infoperfil = document.getElementById('infoperfil');
    const perfilMenu = document.getElementById('perfilMenu');
    const perfilicon = document.getElementById('perfilIcon');
    const overlay = document.getElementById('overlay');

    // Verifica se o overlay está ativo
    if (overlay.style.display === "none") {
        // Verifica se o clique ocorreu fora do botão e do infoperfil
        if (!perfilicon.contains(event.target) && !perfilMenu.contains(event.target)  && !configuracoesButton.contains(event.target) && !infoperfil.contains(event.target)) {
            infoperfil.style.display = 'none';
        }
        
        if (!perfilicon.contains(event.target) && !perfilMenu.contains(event.target)  && !configuracoesButton.contains(event.target) && !infoperfil.contains(event.target)) 
        {
            perfilMenu.style.display = 'none';
        }
    }
});

document.getElementById('del_but').addEventListener('click', deletecount);

async function deletecount(event)
{

    const username = document.getElementById("alter_username").value;
    const password = document.getElementById("alter3_password").value;
   
    document.getElementById("alter_username").value ="";
    document.getElementById("alter3_password").value ="";

    event.preventDefault(); 
    await fetch('/del_conta', {
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
        if(data.data === -1)
        {
            alert('Senha ou nome de usuario estão errados.');
        }
        else
        {
            alert('A conta foi deleta com sucesso.');
           sairconta({ preventDefault: () => {} });
        }
    })
    .catch(error => {
        console.error('Erro ao enviar a solicitação:', error);
    });

}

document.getElementById('perfilsair').addEventListener('click', sairconta);

async function sairconta(event)
{
    localStorage.removeItem('username');
    window.location.reload(); 
}

document.getElementById('alter2_but').addEventListener('click', alter_senha);

async function alter_senha(event)
{

    const username = document.getElementById("alter2_username").value;
    const password = document.getElementById("old_password").value;
    const new_password = document.getElementById("new_password").value;
   
    document.getElementById("alter_username").value ="";
    document.getElementById("old_password").value ="";
    document.getElementById("new_password").value ="";

   

    if(password === new_password)
    {
        alert('Nova senha invalida.');
        return -1;
    }

    if(new_password.length < 6)
    {
        alert('A nova senha deve ter mais que 6 caracteres.');
        return -1;
        
    }
   

    event.preventDefault(); 
    await fetch('/alter_senha', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password,
            newpassword: new_password,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if(data.data === -1)
        {
            alert('Senha ou nome de usuario estão errados.');
        }
        else
        {
            alert('A senha foi alterada com sucesso.');
            sairconta({ preventDefault: () => {} });
        }
    })
    .catch(error => {
        console.error('Erro ao enviar a solicitação:', error);
    });

}

document.getElementById('alter1_but').addEventListener('click', alter_user);

async function alter_user(event)
{
    const username = document.getElementById("old_username").value;
    const password = document.getElementById("alter1_password").value;
    const new_username = document.getElementById("new_username").value;
   
    document.getElementById("old_username").value ="";
    document.getElementById("alter1_password").value ="";
    document.getElementById("new_username").value ="";

    var aux = new_username.replace(/\s/, '');
    if(aux ==="")
    {
        alert('Usuario deve ter algum caractere além do espaço.');
        return -1;
    }

    if (username === new_username)
    {
        alert('Novo nome de usuario é igual ao antigo.');
        return -1;
    }

    event.preventDefault(); 
    await fetch('/alter_user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password,
            newusername: new_username,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if(data.data === -1)
        {
            alert('Senha ou nome de usuario estão errados.');
        }
        else
        {
            alert('O username foi alterado com sucesso.');
            sairconta({ preventDefault: () => {} });
        }
    })
    .catch(error => {
        console.error('Erro ao enviar a solicitação:', error);
    });

}


document.getElementById('alter_img').addEventListener('click', alter_img);
async function alter_img(event) {
    event.preventDefault();

    const overlay = document.getElementById('overlay');
    fetch('/get_images')
        .then(response => response.json())
        .then(data => {
            const gallery = document.getElementById('gallery');
            const selectedImage = document.getElementById('selectedImage');

            // Verificar se a galeria está vazia
            if (gallery.childElementCount === 0) {
                data.imagens.forEach(imagem => {
                    // Criar uma miniatura (thumbnail) para cada imagem
                    const imgElement = document.createElement('img');
                    imgElement.src = 'data:image/png;base64,' + imagem.imagem;
                    imgElement.alt = 'Imagem ' + imagem.id;
                    imgElement.classList.add('thumbnail');

                    // Adicionar um evento de clique para exibir a imagem completa quando a miniatura for clicada
                    imgElement.addEventListener('click', () => {
                        substituirImagemPerfil('data:image/png;base64,' + imagem.imagem);
                        selectedImage.src = 'data:image/png;base64,' + imagem.imagem;
                        selectedImage.alt = 'Imagem ' + imagem.id;
                    });

                    // Adicionar a miniatura à galeria
                    gallery.appendChild(imgElement);
                });
            }
        })
        .catch(error => console.error('Erro ao obter imagens:', error));
    overlay.style.display = "block";
    gallery.style.display = "grid";

    document.getElementById('overlay').addEventListener('click', clickOutsideHandler);
}

async function substituirImagemPerfil(src) {
    const perfilIcon = document.getElementById('perfilIcon');
    perfilIcon.src = src;  
    perfilIcon.style.borderRadius = '50%'; // Adicione a borda arredondada desejada aqui
}

async function clickOutsideHandler(event) {
    const overlay = document.getElementById('overlay');
    const gallery = document.getElementById('gallery');

    overlay.style.display = "none";
    gallery.style.display = "none";

    // Remover o event listener após ocultar os elementos
    document.removeEventListener('click', clickOutsideHandler);
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
                    if(event.data !== 3 && event.data!==-1 && event.data!==1)
                    {
                        playerContainer.remove();
                    }
                }
            }
        });
    }
}
