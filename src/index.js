/**
 * @param {String} title
 * @param {String} content
 * @param {Array} buttons
 * @param {Object} classNames
 * @constructor
 */
export function Dialog({title, content, buttons, classNames = {dialog: '', title: '', content: '', buttons: ''}}) {

    // check if all parameters are passed
    if (!title || !content || !buttons) {
        throw new Error('Missing parameters')
    }

    const randomId = (prefix) => {
        return prefix + Math.random().toString(36).substr(2, 9)
    }

    const tpl = `
        <div class="${classNames['title']}">${title}</div>
        <div class="${classNames['content']}">${content}</div>
        <div class="${classNames['buttons']}">
            ${buttons.map(button => `<button class="${button.classNames}">${button.text}</button>`).join('')}
        </div>
    `

    let dialog;
    const mouseEvents = ['onclick', 'oncontextmenu', 'ondblclick', 'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup']

    return {
        create(options = {appendTo: null}) {

            // create dialog element
            const dialogElement = document.createElement('dialog')
            dialogElement.id = randomId('html-dialog-')
            dialogElement.className = classNames['dialog'] ?? ''
            dialogElement.innerHTML = tpl

            // append dialog to body or to a custom element
            if (options.appendTo) {
                options.appendTo.appendChild(dialogElement)
            } else {
                document.body.appendChild(dialogElement)
            }
            dialog = document.querySelector(`#${dialogElement.id}`)

            // add event listeners to buttons
            buttons.forEach((button, index) => {
                const buttonElement = dialog.querySelector(`button:nth-child(${index + 1})`)

                // check if the button has an allowed mouse event and add it
                Object.keys(button).forEach(mouseEvent => {
                    if (mouseEvents.includes(mouseEvent)) {
                        const eventType = mouseEvent.replace('on', '')
                        buttonElement.addEventListener(eventType, (event) => {
                            button[mouseEvent].call(dialog, event)
                        })
                    }
                })
            })

            return this
        },
        open() {
            dialog.showModal()
            return this
        },
        close() {
            dialog.close()
            return this
        },
        destroy() {
            document.body.removeChild(dialog)
            delete this
        }
    }
}
