document.addEventListener('keydown', (event) => {
    const block = event.target;
    if (!block.classList.contains('input-block')) {
        return;
    }

    const blocks = Array.from(block.parentNode.children);
    const index = blocks.indexOf(block);
    const key = event.key;

    if (key === 'Enter') 
    {
        const word = blocks.map(block => block.textContent).join('');
        const x = 'fruta'
        
        if (word.length === 5)
        {
			
            if (word === x) 
            {
				blocks.forEach(block => {
					block.contentEditable = false; // torna os blocos não editáveis
					block.style.backgroundColor = 'green';
				});
            }
            else
            {
                const newContainer = document.createElement('div');
                newContainer.className = 'blocks-container';
                for(let i=0; i<5; i++){
                    const newBlock = document.createElement('div');
                    newBlock.className = 'input-block';
                    newBlock.id = `${i+1}`;
                    newBlock.contentEditable = true;
                    newContainer.appendChild(newBlock);
                }
                
				blocks.forEach(block => {
					block.contentEditable = false; // torna os blocos não editáveis
					if(block.textContent === x[parseInt(block.id)-1]) 
						block.style.backgroundColor = 'green';
				});
				
				blocks.forEach(block => {
					// se o bloco contém uma letra que está na palavra x
					if(x.includes(block.textContent)) {
						// conta quantas vezes essa letra aparece na palavra x
						const countInX = Array.from(x).filter(letter => letter === block.textContent).length;

						// conta quantas vezes essa letra já foi colorida de amarelo
						const countInBlocks = Array.from(blocks).filter(b => b.textContent === block.textContent && (b.style.backgroundColor === 'yellow' || b.style.backgroundColor === 'green')  ).length;

						// se a letra não foi colorida mais vezes do que aparece na palavra x
						if(countInBlocks < countInX) {
							// colore o bloco de amarelo
							block.style.backgroundColor = 'yellow';
						}
					}
					 if(block.style.backgroundColor === '') // se o bloco não foi pintado
						block.style.backgroundColor = '#ccc'; // adiciona uma sombra escura
				});
				
				
				 
                document.body.appendChild(newContainer);
            }
        }
    }

    if (key.length === 1 && key.match(/\S/)) 
    {
        blocks[index].textContent = key;
        if (index < blocks.length - 1) 
            blocks[index + 1].focus();
    } 
    if (key === 'Backspace') 
    {
        blocks[index].textContent = "";
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


document.addEventListener('click', (event) => {
    const block = event.target;
    if (block.classList.contains('input-block') && block.getAttribute('contentEditable') == 'false') {
        event.preventDefault();
    }
});
