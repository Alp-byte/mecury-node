import { Injectable } from '@angular/core';

import * as x2js from 'x2js';

import * as objectPath from 'object-path';

interface Style {
    tag: string,
    directives: string[]
}

interface Mapping {
    name: string,
    tag: string,
    values: string[]
}

const THEME_MAPPING = [
    {
        path: 'Colors.Background.Body',
        tag: 'body',
        prefix_val: [
            'background-color'
        ]
    },
    {
        path: 'Colors.Text.Main',
        tag: 'body',
        prefix_val: [
            'color'
        ]
    },
    {
        path: 'Colors.Background.Menu',
        tag: '.navigation nav',
        prefix_val: [
            'background-color'
        ]
    },
    {
        path: 'Colors.Background.Top',
        tag: '.navbar-default',
        prefix_val: [
            'background-color'
        ]
    },
    {
        path: 'Colors.Background.AuthButton',
        tag: '.navbar-right',
        prefix_val: [
            'background-color'
        ]
    },
    {
        path: 'Colors.Background.PanelHeading',
        tag: '.panel .panel-heading',
        prefix_val: [
            'background-color'
        ]
    },
    {
        path: 'Colors.Background.PanelBody',
        tag: '.panel .panel-body',
        prefix_val: [
            'background-color'
        ]
    },
    {
        path: 'Colors.Background.NewItemButton',
        tag: '.newitem',
        prefix_val: [
            'background-color'
        ]
    },
    {
        path: 'Colors.Background.RefreshButton',
        tag: '.refresh',
        prefix_val: [
            'background-color'
        ]
    },
    {
        path: 'Colors.Background.ButtonWarning',
        tag: '.btn-warning',
        prefix_val: [
            'background-color'
        ]
    },
    {
        path: 'Colors.Background.Blockquote',
        tag: 'blockquote',
        prefix_val: [
            'background-color'
        ]
    },
    {
        path: 'Colors.Background.ButtonDefault',
        tag: '.btn-default',
        prefix_val: [
            'background-color'
        ]
    },
    {
        path: 'Colors.Text.Price',
        tag: '.code',
        prefix_val: [
            'color'
        ]
    },
    {
        path: 'Colors.Text.Header',
        tag: 'h3',
        prefix_val: [
            'color'
        ]
    },
    {
        path: 'Colors.Text.Blockquote',
        tag: 'blockquote',
        prefix_val: [
            'color'
        ]
    },
    {
        path: 'Colors.Text.Underheader',
        tag: 'small',
        prefix_val: [
            'color'
        ]
    },
    {
        path: 'Colors.Text.NewItemButton',
        tag: '.newitem',
        prefix_val: [
            'color'
        ]
    },
    {
        path: 'Colors.Text.RefreshButton',
        tag: '.refresh',
        prefix_val: [
            'color'
        ]
    },
    {
        path: 'Colors.Text.Secondary',
        tag: '.panel',
        prefix_val: [
            'color'
        ]
    },
    {
        path: 'Sizes.Text.Main',
        tag: 'body',
        prefix_val: [
            'font-size'
        ]
    },
    {
        path: 'Sizes.Text.Header',
        tag: 'h3',
        prefix_val: [
            'font-size'
        ]
    },
    {
        path: 'Sizes.Text.Unerheader',
        tag: 'small',
        prefix_val: [
            'font-size'
        ]
    },
    {
        path: 'Colors.Text.Blockquote',
        tag: 'blockquote',
        prefix_val: [
            'font-size'
        ]
    }
]


@Injectable()
export class StylesheetService {
    private stylesheet: HTMLStyleElement;
    private styles: Style[] = [];
    private x2js = new x2js();

    create() {
        this.stylesheet = document.createElement("style");

        this.stylesheet.id = "dynamic-style";
        this.stylesheet.media = "screen";
        this.stylesheet.type = "text/css";

    }

    private readXML(xml) {
        return this.x2js.xml2js(xml);
    }

    addStyle(tag, directive) {
        let styleIndex = this.styles.findIndex(style => style.tag == tag)
        if(styleIndex == -1) {
            this.styles.push(<Style>{
                tag: tag,
                directives: [directive]
            })
        } else {
            this.styles[styleIndex].directives.push(directive);
        }
    }

    private formStyles(): string {
        let stylesheet = '';
        this.styles.forEach(style => {
            stylesheet = stylesheet + `
            ${style.tag} {`;
            style.directives.forEach(directive => {
                stylesheet = stylesheet + `
                    ${directive}!important;`;
            })
            stylesheet = stylesheet + `
            }
            `
        })
        return stylesheet;
    }

    apply(styles = null) {
        if(styles)
            this.styles = styles;
        this.stylesheet.textContent = this.formStyles();
        let head = document.getElementsByTagName('HEAD')[0];        
        head.appendChild(this.stylesheet);
    }

    eatXML(xml): any {
        let themeJSON = this.readXML(xml);
        THEME_MAPPING.forEach(item => {
            let val = objectPath.get(themeJSON, "TheApp."+item.path, false);
            if(val) 
                item.prefix_val.forEach(prefix_val => {
                    this.addStyle(item.tag, prefix_val + ": " + val)
                })
        })   
        

        return {
            name: themeJSON['TheApp']['Name'],
            date: Date.now(),
            author: themeJSON['TheApp']['Author'],
            value: this.styles
        }
    }
}