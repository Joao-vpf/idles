
var vida = 7;

window.onload = function() {
    var username = localStorage.getItem('username');
    search_x(localStorage.getItem("modogame"));
    if (username) 
    {
        conf_login(username);
    }
}
var x;

async function search_x(tipo)
{
    if(tipo == 1)
    {
        if (x===undefined)
        { 
            fetch('/get_data')
            .then(response => response.json())
            .then(data => {
                x= data.data;
            });
        }
        var text_modo = document.getElementById("md_game");
        text_modo.textContent ="Infinito ♾️";
        localStorage.setItem("modogame", 1);
    }
    else
    {
        const res = await verif_jogado(localStorage.getItem('username'));
        if( res === 0)
        {
            await fetch('/get_today')
            .then(response => response.json())
            .then(data => {
                x= data.data;
            });
        }
        else
        {
            var all_blocks=document.getElementsByClassName("input-block");
            Array.from(all_blocks).forEach((block) => {
                block.contentEditable = false; 
            
            });
            customAlert("Esse modo já foi jogado");
        }
        var text_modo = document.getElementById("md_game");
        text_modo.textContent ="Palavra do dia 🎯";
        localStorage.setItem("modogame", 0);
    }
}



async function verif_jogado(username)
{
    var res=0;
    if(username != null)
    {   
        await fetch('/get_user_today', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
            }),
        })
        .then(response => response.json())
        .then(data => {
            res=data.data;
        })
        .catch(error => {
            console.error('Erro ao enviar a solicitação:', error);
        });
    }
    return res;
}



var last_block = -1; 

document.addEventListener('keydown', (event) => {


    block = event.target;
    if (last_block !== -1 && ((event.key === 'Backspace' &&  document.activeElement.tagName !== 'INPUT') || event.key ===  'ArrowLeft' || (event.key === 'Enter' &&  document.activeElement.tagName !== 'INPUT')))
    {
        block = last_block;
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
    removealert();
    const blocks = Array.from(block.parentNode.children);
    const index = blocks.indexOf(block);
    const key = event.key;

    switch (key) {
        case 'Enter':
            checkWord(blocks) === 1
            break;
        case 'Backspace':
            if (blocks[index].textContent === "" && index > 0)
            {
                blocks[index-1].focus();
                blocks[index-1].textContent = "";
                last_block = blocks[index-1];
            }
            else
            {
                blocks[index].focus();
                blocks[index].textContent = "";
                last_block = blocks[index];
            }
            break;
        case 'ArrowLeft':
            if (index > 0) {
                blocks[index - 1].focus();
                last_block = blocks[index - 1];
            }
            break;
        case 'ArrowRight':
            if (index < blocks.length - 1) {
                blocks[index + 1].focus();
                last_block = blocks[index + 1];
            }
            break;
        default:
            if (key.length === 1 && key.match(/[a-z]/i)) {
                blocks[index].textContent = key.toUpperCase();
                blocks[index].classList.add('grow'); 
                if (index < blocks.length - 1) {
                    blocks[index + 1].focus();
                    last_block = blocks[index + 1];
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


document.getElementById('next_bt').addEventListener('click', next);
async function next()
{
    await fetch('/set_new_score_game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: localStorage.getItem("username"),
            wins: localStorage.getItem("vitorias"),
        }),
    }).then(response => response.json())
    .then(data => {
        if(data.data !== 1)
        {
            localStorage.setItem("vitorias", 0);
        }
    });

    window.location.reload();
}


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
                
                last_block = -1;
                removealert();
                if (word === x) 
                {  
                    animateBlocks(blocks);
                    if(localStorage.getItem("modogame") == 0)
                    {
                        salvar_today();
                    }
                    else
                    {
                        localStorage.setItem("vitorias", localStorage.getItem("vitorias")+1);
                        const bt_next = document.getElementById("button-next");
                        bt_next.style.display="block";
                    }
                } 
                else 
                {
                    removeheart();
                    vida -= 1;
                    handleWrongWord(blocks);
                    if(vida == 0)
                    {
                        if(localStorage.getItem("modogame") == 0)
                        {
                            salvar_today();
                        }
                        else
                        {
                            localStorage.setItem("vitorias", 0);
                            const bt_next = document.getElementById("button-next");
                            bt_next.style.display="block";
                        }
                    }
                }   
                return 1;         
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
    adicionar_letra_bloco(blocks.map(block => block.textContent).join(''));
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
    adicionar_letra_bloco(blocks.map(block => block.textContent).join(''));

    if (vida > 0) {
        createNewContainer();
    }
    else
    {
        customAlert("A palavra era: " + x)
    }
}

function adicionar_letra_bloco(word) 
{
    var h = document.getElementById("letras_res");
    var usadas = document.getElementById("letras_des");
    for(var i = 0; i<5; i++)
    {
        if (h.textContent.includes(word[i]))
        {
            const index = h.textContent.search(word[i]);
            h.textContent = h.textContent.replace(word[i], "");
            h.textContent.trim();
            h.textContent.replace(/(.)\1+/g, '$1');
        }
        if(!usadas.textContent.includes(word[i]))
        {
            var letras_usadas = usadas.textContent+word[i];
            letras_usadas = letras_usadas.replace(/\s/g, ""); 
            letras_usadas = letras_usadas.split('').sort().join(' '); 
            usadas.textContent = letras_usadas;
        }
    }

}


function removealert()
{
    var alertBox = document.getElementById('alert1');
    if (!alertBox.textContent.includes("A palavra era: "))
    {
        alertBox.style.opacity = "0";
    }
}

function customAlert(msg) {

    removealert();

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
document.getElementById("loginButton").addEventListener("click", login);

async function login(event) 
{
    event.preventDefault(); 
    
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    if(!username || !password)
    {
        alert('Login falhou. Verifique suas credenciais.');

    }
    else
    {
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
}

async function obterImagemDoUsuario(username) 
{
    const response = await fetch(`/imagem/${username}`);
    
    if (response.ok) 
    {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        // Substituir a imagem do perfil no HTML
        const perfilIcon = document.getElementById('perfilIcon');
        perfilIcon.src = imageUrl;
        perfilIcon.style.borderRadius = '50%';
        const easter = localStorage.getItem("easteregg")
        if(easter)
            easter_eggs(easter);
    } 
    else {
        console.error('Erro ao obter a imagem do usuário:', response.status);
    }
}

async function obterhistoriodousuario(username)
{
    await fetch('/get_hist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
        }),
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem("best_score", data.best_score);
        localStorage.setItem("last_5_today", data.last_5_today);
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

    obterhistoriodousuario(username);
    obterImagemDoUsuario(username);

    easter_eggs(username);

 
    
    await fetch('/get_all_images')
            .then(response => response.json())
            .then(data => {
                data.imagens.forEach(imagem => {
                    // Criar uma miniatura (thumbnail) para cada imagem
                    const imgElement = document.createElement('img');
                    const byteCharacters = atob(imagem.imagem);
                    const byteNumbers = new Array(byteCharacters.length);

                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);

                    // Criar Blob a partir do array de bytes
                    const blob = new Blob([byteArray], { type: 'image/png' });

                    // Criar URL do Blob
                    const imageUrl = URL.createObjectURL(blob);

                    imgElement.src = imageUrl;
                    imgElement.alt = 'Imagem ' + imagem.id;
                    imgElement.classList.add('thumbnail');

                    imgElement.addEventListener('click', () => {
                        substituirImagemPerfil(imageUrl, imagem.id);
                    });

                    // Adicionar a miniatura à galeria
                    gallery.appendChild(imgElement);
                });
            })
            .catch(error => console.error('Erro ao obter imagens:', error));

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

document.getElementById('historicoButton').addEventListener('click',  hist);

async function hist(event)
{
    event.preventDefault(); 
    if (document.getElementById('infoperfil').style.display === 'none')
    {
        document.getElementById('infoperfil').style.display = 'flex';
        document.getElementById('infohist').style.display = 'flex';
        carregar_hist();
    }
    else
    {
        if ( document.getElementById('infoconfig').style.display === 'none')
        {
            document.getElementById('infohist').style.display = 'none';
            document.getElementById('infoperfil').style.display = 'none';
        }
        else
        {
            carregar_hist();
            document.getElementById('infohist').style.display = 'flex';
            document.getElementById('infoconfig').style.display = 'none';
        }
    }
   
}


async function carregar_hist()
{
    const plv_dia = document.getElementById("plv_dia_verifres");
    const inf_scr =  document.getElementById("maior_sequencia_infres");
    if( localStorage.getItem("best_score") <2)
    {
        inf_scr.textContent= "A maior sequencia foi "+ localStorage.getItem("best_score") + "x sem perder";
    }
    else
    {
        inf_scr.textContent= "A maior sequencia foram "+ localStorage.getItem("best_score") + "x sem perder";
    }
    const res = await verif_jogado(localStorage.getItem('username'));
    if (res === 1)
    {
        plv_dia.textContent="A palavra do dia já foi jogada ✅" ;  
    }
    else
    {
        plv_dia.textContent="A palavra do dia ainda não foi jogada ❌";
    }
    const lista_last_5_games = localStorage.getItem("last_5_today").split(",");
    for (var i = 0; i < lista_last_5_games.length; i+=2) {
        let numero = parseInt(lista_last_5_games[i]);
        let palavra = lista_last_5_games[i+1];
        if (numero === -1)
            numero = 7;

        var elementId = "bar_hist-" + i/2;
        var element = document.getElementById(elementId);

        element.style.height = (numero * 100) / 7 + "px";
        element.setAttribute("data-value", `${(numero * 100) / 7}%`);

        element.setAttribute("title", `Vida usadas: ${numero}`);
        
        var elementId = "bar_label-" + i/2;
        var element = document.getElementById(elementId);
        element.textContent = palavra;
    }


}

document.getElementById('configuracoesButton').addEventListener('click', config);
async function config(event)
{
    event.preventDefault(); 

    if (document.getElementById('infoperfil').style.display === 'none')
    {
        document.getElementById('infoperfil').style.display = 'flex';
        document.getElementById('infoconfig').style.display = 'flex';
    }
    else
    {
        if ( document.getElementById('infohist').style.display === 'none')
        {
            document.getElementById('infoconfig').style.display = 'none';
            document.getElementById('infoperfil').style.display = 'none';
        }
        else
        {
            document.getElementById('infoconfig').style.display = 'flex';
            document.getElementById('infohist').style.display = 'none';
        }
    }
		
}


document.addEventListener('click', function (event) {
    //fecha abas menu e infoperfil
    const configuracoesButton = document.getElementById('configuracoesButton');
    const infoperfil = document.getElementById('infoperfil');
    const perfilMenu = document.getElementById('perfilMenu');
    const perfilicon = document.getElementById('perfilIcon');
    const menumodo = document.getElementById("icon-menu-container")
    const menumodoaberto = document.getElementById("barra_menu_icon")
    const overlay = document.getElementById('overlay');

    // Verifica se o overlay está ativo
    if (overlay.style.display === "none") {
        // Verifica se o clique ocorreu fora do botão e do infoperfil
        if (!menumodoaberto.contains(event.target) && !menumodo.contains(event.target) &&!perfilicon.contains(event.target) && !perfilMenu.contains(event.target)  && !configuracoesButton.contains(event.target) && !infoperfil.contains(event.target)) {
            infoperfil.style.display = 'none';
        }
        
        if (!menumodoaberto.contains(event.target) && !menumodo.contains(event.target) &&!perfilicon.contains(event.target) && !perfilMenu.contains(event.target)  && !configuracoesButton.contains(event.target) && !infoperfil.contains(event.target)) 
        {
            perfilMenu.style.display = 'none';
        }

        if(!menumodoaberto.contains(event.target) && !menumodo.contains(event.target) && !perfilicon.contains(event.target) && !perfilMenu.contains(event.target)  && !configuracoesButton.contains(event.target) && !infoperfil.contains(event.target)) 
        {
            menumodoaberto.style.display = 'none';
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
    localStorage.removeItem('modojogo');
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
            if (data.data=== 2)
            {
                alert('O novo nome de usuario já existe.');
            }
            else
            {
                alert('O username foi alterado com sucesso.');
                sairconta({ preventDefault: () => {} });
            }
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
    const gallery = document.getElementById('gallery');
    const selectedImage = document.getElementById('selectedImage');
    
    // Verificar se a galeria está vazia
    if (gallery.childElementCount === 0) {
        await fetch('/get_all_images')
            .then(response => response.json())
            .then(data => {
                data.imagens.forEach(imagem => {
                    // Criar uma miniatura (thumbnail) para cada imagem
                    const imgElement = document.createElement('img');
                    const byteCharacters = atob(imagem.imagem);
                    const byteNumbers = new Array(byteCharacters.length);

                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);

                    // Criar Blob a partir do array de bytes
                    const blob = new Blob([byteArray], { type: 'image/png' });

                    // Criar URL do Blob
                    const imageUrl = URL.createObjectURL(blob);

                    imgElement.src = imageUrl;
                    imgElement.alt = 'Imagem ' + imagem.id;
                    imgElement.classList.add('thumbnail');
                    imgElement.addEventListener('click', () => {
                        substituirImagemPerfil(imageUrl, imagem.id);
                    });

                    // Adicionar a miniatura à galeria
                    gallery.appendChild(imgElement);
                });
            })
            .catch(error => console.error('Erro ao obter imagens:', error));

    }

    overlay.style.display = "block";
    gallery.style.display = "grid";
    document.getElementById('overlay').addEventListener('click', clickOutsideHandler);
}


async function substituirImagemPerfil(src, imageId) 
{
    localStorage.setItem("easteregg", "");
    easter_eggs("");
    const perfilIcon = document.getElementById('perfilIcon');
    perfilIcon.src = src;  
    perfilIcon.style.borderRadius = '50%';
    perfilIcon.style.height = "40px";
    perfilIcon.style.width = "40px";
    
    if(imageId === 15)
    {
        easter_eggs("yoda");
    }
    if(imageId === 14)
    {
        easter_eggs("vader");
    }
    await fetch('/set_image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: localStorage.getItem('username'),
            id_image: imageId,
        }),
    })
    .then(response => response.json())
    .catch(error => {
        console.error('Erro ao enviar a solicitação:', error);
    });
}

async function clickOutsideHandler(event) {
    const overlay = document.getElementById('overlay');
    const gallery = document.getElementById('gallery');

    overlay.style.display = "none";
    gallery.style.display = "none";

    // Remover o event listener após ocultar os elementos
    document.removeEventListener('click', clickOutsideHandler);
}


/* Menu de opções */

document.getElementById('icon-menu-container').addEventListener('click', icon_menu_container);



async function icon_menu_container(event)
{
    event.preventDefault();
    const  barra_menu= document.getElementById('barra_menu_icon');

    if( barra_menu.style.display ==="none")
    {
        barra_menu.style.display ="flex"
    }
    else
    {
        barra_menu.style.display ="none"
    }
    
}

document.getElementById("menu_icon_today").addEventListener("click",menu_icon_today)

async function menu_icon_today(event)
{
    event.preventDefault();
    var text_modo = document.getElementById("md_game");
    window.location.reload(); 
    localStorage.setItem("modogame", 0);
}


document.getElementById("menu_icon_inf").addEventListener("click",menu_icon_inf)

async function menu_icon_inf(event)
{
    event.preventDefault();
    var text_modo = document.getElementById("md_game");
    window.location.reload(); 
    localStorage.setItem("modogame", 1);
}

async function salvar_today()
{
    await fetch('/set_today', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: localStorage.getItem('username'),
            count_erro: 7-vida
        }),
    })
    .then(response => response.json())
    .catch(error => {
        console.error('Erro ao enviar a solicitação:', error);
    });
}

/* easter eggs */
async function easter_eggs(tipo) {
    const perfilIcon = document.getElementById('perfilIcon');
    perfilIcon.style.borderRadius = '';
    perfilIcon.style.boxShadow = '';
    perfilIcon.style.animation = '';


    switch (tipo) {
        case "napoleao":
            onYouTubeIframeAPIReady(true);
            break;
        case "yoda":
            localStorage.setItem("easteregg","yoda")
            perfilIcon.style.borderRadius = '50%';
            perfilIcon.style.boxShadow = '0 0 2.5px #0f0, 0 0 5px #0f0, 0 0 10px #0f0';
            perfilIcon.style.animation = 'brilho 2.5s infinite';

            // Adicionando a animação usando @keyframes
            const estiloCSSYoda = document.styleSheets[0];
            estiloCSSYoda.insertRule(`
            @keyframes brilho {
                0% { box-shadow: 0 0 2.5px #0f0, 0 0 5px #0f0, 0 0 10px #0f0; }
                50% { box-shadow: 0 0 5px #0f0, 0 0 10px #0f0, 0 0 15px #0f0; }
                100% { box-shadow: 0 0 2.5px #0f0, 0 0 5px #0f0, 0 0 10px #0f0; }
            }
            `, estiloCSSYoda.rules.length);
            break;
        case "vader":
            localStorage.setItem("easteregg","vader")
            perfilIcon.style.borderRadius = '50%';
            perfilIcon.style.boxShadow = '0 0 2.5px #f00, 0 0 5px #f00, 0 0 10px #f00';
            perfilIcon.style.animation = 'brilho 2.5s infinite';
            
            // Adicionando a animação usando @keyframes
            const estiloCSSVader = document.styleSheets[0];
            estiloCSSVader.insertRule(`
            @keyframes brilho {
                0% { box-shadow: 0 0 2.5px #f00, 0 0 5px #f00, 0 0 10px #f00; }
                50% { box-shadow: 0 0 5px #f00, 0 0 10px #f00, 0 0 15px #f00; }
                100% { box-shadow: 0 0 2.5px #f00, 0 0 5px #f00, 0 0 10px #f00; }
            }
            `, estiloCSSVader.rules.length);
            break;
        default:
            break;
    }
}


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