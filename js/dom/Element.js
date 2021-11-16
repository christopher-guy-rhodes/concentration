class Element {
    constructor(document, tag, id, cssClass, innerText, attributes) {
        validateRequiredParams(this.constructor, arguments, 'document', 'tag');
        this.document = document;
        this.tag = tag;
        this.id = id;
        this.class = cssClass;
        this.innerText = innerText;
        this.attributes = attributes;

        this.node = this.createElement();
    }

    createElement() {
        let element = this.document.createElement(this.tag);
        if (this.id !== undefined) {
            element.id = this.id;
        }
        if (this.class !== undefined) {
            element.className = this.class;
        }
        if (this.innerText !== undefined) {
            element.innerText = this.innerText;
        }
        if (Object.keys(this.attributes).length > 0) {
            for (let key of Object.keys(this.attributes)) {
                element.setAttribute(key, this.attributes[key]);
            }
        }
        return element;
    }

    appendChild(element) {
        if (this.tag === 'body') {
            // The append does not work for "body" unless the document is used. Not sure why
            this.document.body.appendChild(element.node);
        } else {
            this.node.appendChild(element.node);
        }
        return this;
    }
}
