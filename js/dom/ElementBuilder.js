class ElementBuilder {
    constructor(document) {
        this.document = document;
        this.tag = undefined;
        this.id = undefined;
        this.class = undefined;
        this.innerText = undefined;
        this.attributes = {};
    }

    withTag(tag) {
        validateRequiredParams(this.withTag, arguments, 'tag');
        this.tag = tag;
        return this;
    }

    withId(id) {
        validateRequiredParams(this.withId, arguments, 'id');
        this.id = id;
        return this;
    }

    withClass(cssClass) {
        validateRequiredParams(this.withClass, arguments, 'cssClass');
        this.class = cssClass;
        return this;
    }

    withInnerText(text) {
        validateRequiredParams(this.withInnerText, arguments, 'text');
        this.innerText = text;
        return this;
    }

    withAttribute(name, value) {
        validateRequiredParams(this.withAttribute, arguments, 'name', 'value');
        this.attributes[name] = value;
        return this;
    }

    build() {
        return new Element(this.document, this.tag, this.id, this.class, this.innerText, this.attributes);
    }
}
