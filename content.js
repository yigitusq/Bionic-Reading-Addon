function convertTextToBionic(text) {
    return text.split(/\s+/).map(word => {
        if (word.length <= 2 || !/\w/.test(word)) {
            return word;
        }
        const boldLength = Math.ceil(word.length / 2);
        const boldPart = word.substring(0, boldLength);
        const normalPart = word.substring(boldLength);
        return `<strong>${boldPart}</strong>${normalPart}`;
    }).join(' ');
}

function processNode(node) {
    if (node.dataset.bionicProcessed) {
        return;
    }

    const treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (treeWalker.nextNode()) {
        const parentTag = treeWalker.currentNode.parentElement.tagName.toUpperCase();
        if (parentTag !== 'SCRIPT' && parentTag !== 'STYLE' && treeWalker.currentNode.textContent.trim().length > 0) {
            textNodes.push(treeWalker.currentNode);
        }
    }

    textNodes.forEach(textNode => {
        const bionicHTML = convertTextToBionic(textNode.textContent);
        const wrapper = document.createElement('span'); 
        wrapper.innerHTML = bionicHTML;
        textNode.replaceWith(...wrapper.childNodes); 
        });
    
    node.dataset.bionicProcessed = true;
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            processNode(entry.target);
            observer.unobserve(entry.target);
        }
    });
}, {
   rootMargin: '250px'
});


document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, td, a, div').forEach(element => {

    let hasDirectText = false;
    for (const child of element.childNodes) {
        if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 2) {
            hasDirectText = true;
            break;
        }
    }

    if (hasDirectText) {
       observer.observe(element);
    }
});