const blocks = document.querySelectorAll('.input-block');

blocks.forEach((block, index) => {

       block.addEventListener('keydown', (event) => {
            const key = event.key;
            if (key === 'Enter') 
            {
                const word = Array.from(blocks).map(block => block.textContent).join('');
                if (word.length === 5)
                {
                    if (word === 'termo') 
                    {
                        alert('Palavra formada é igual a "termo"!');
                    }
                    else
                    {
                        alert('errou');
                         // Cria um novo bloco de contêiner
                        const newContainer = document.createElement('div');
                        newContainer.className = 'blocks-container';
                        for(let i=0; i<5; i++){
                            const newBlock = document.createElement('div');
                            newBlock.className = 'input-block';
                            newBlock.id = `block${i+1}`;
                            newBlock.contentEditable = true;
                            newContainer.appendChild(newBlock);
                        }
                        document.body.appendChild(newContainer);
                    }
                }
            }

            if (key.length === 1 && key.match(/\S/)) 
            {
                blocks[index].textContent = key
                if (index < blocks.length - 1) 
                    blocks[index + 1].focus();
            } 
            if (key === 'Backspace') 
            {
                blocks[index].textContent = ""
                if (index > 0) 
                    blocks[index - 1].focus();
            }

            if ( key === 'ArrowLeft')
                if (index > 0) 
                    blocks[index - 1].focus();
            if ( key === 'ArrowRight')
                if (index < blocks.length - 1) 
                    blocks[index + 1].focus();

            event.preventDefault();
      });
});
