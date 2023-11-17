let vida = 7;

document.addEventListener('keydown', (event) => {
    const block = event.target;
    if (!block.classList.contains('input-block')) {
        return;
    }

    const blocks = Array.from(block.parentNode.children);
    const index = blocks.indexOf(block);
    const key = event.key;
	
	if (key.length === 1 && !key.match(/[a-z]/i)) {
        event.preventDefault();
        return;
    }


    if (key === 'Enter') 
    {
        const word = blocks.map(block => block.textContent).join('');
        const x = 'MANGA'
        
        if (word.length === 5)
        {
			
            if (word === x) 
            {//Animação e finalização dos blocos ao acertar a palavra
				blocks.forEach((block, index) => {
					setTimeout(() => { 
						block.contentEditable = false; 
						block.style.backgroundColor = '#00a471';
						block.classList.add('onda');
					}, index * 40); 
				});
			}
            else
            {//errou a palavra

				vida-=1;
                //criar um novo container
                const newContainer = document.createElement('div');
                newContainer.className = 'blocks-container';
                for(let i=1; i<=5; i++){
                    const newBlock = document.createElement('div');
                    newBlock.className = 'input-block';
                    newBlock.id = `${i}`;
                    newBlock.contentEditable = true;
                    newContainer.appendChild(newBlock);
                }
                
                //pintar no bloco novas cores
				blocks.forEach(block => {
					block.contentEditable = false;
					if(block.textContent === x[parseInt(block.id)-1]) 
						block.style.backgroundColor = '#00a471';
				});
				
				blocks.forEach(block => {
					if(x.includes(block.textContent)) 
                    {
                        const countInX = Array.from(x).filter(letter => letter === block.textContent).length;
                        const countInBlocks = Array.from(blocks).filter(b => b.textContent === block.textContent && (window.getComputedStyle(b).backgroundColor === '#f9f494' || window.getComputedStyle(b).backgroundColor === '#00a471')).length;
                        
						if(countInBlocks < countInX && window.getComputedStyle(block).backgroundColor === 'rgba(0, 95, 107, 0.3)') 
                        {
							block.classList.add('yshake');
							block.style.backgroundColor = '#f9f494';
						}
					}
					if(window.getComputedStyle(block).backgroundColor === 'rgba(0, 95, 107, 0.3)')
					{
						block.classList.add('rshake');
						block.style.backgroundColor = '#e87f7f'; 
					}
				});
				
				if (vida > 0)
				{
					document.body.appendChild(newContainer);
					newContainer.children[0].focus();
				}
            }
        }
    }

    if (key.length === 1 && key.match(/\S/)) 
    {
        blocks[index].textContent = key.toUpperCase();
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

document.addEventListener('copy', (event) => {
    event.preventDefault();
});

document.addEventListener('paste', (event) => {
    event.preventDefault();
});

document.addEventListener('cut', (event) => {
    event.preventDefault();
});
