/**
 * @param {String} title
 * @param {String} content
 * @param {Array} buttons
 * @param {Object} classNames
 * @constructor
 */
export const Dialog = ({title, content, buttons, classNames = {dialog: '', title: '', content: '', buttons: ''}}) => {

    // check if all parameters are passed
    if (!title || !content || !buttons) {
        throw new Error('Missing parameters')
    }

    const tpl = `
    <form method="dialog">
        <div class="${classNames['title']}">${title}</div>
        <div class="${classNames['content']}">${content}</div>
        <div class="${classNames['buttons']}">
        ${buttons.map(button => `<button type="${button?.type ?? 'button'}" class="${button.classNames ?? ''}">${button.text}</button>`).join('')}
        </div>
    </form>
    `

    let dialog, form;
    const mouseEvents = ['onclick', 'oncontextmenu', 'ondblclick', 'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup']

    return {
        /**
         * Create dialog instance and append it to the DOM.
         * @param {Object} options
         * @param {HTMLElement} options.appendTo
         * @param {String} options.title - dialog title
         * @param {String} options.content - dialog content, can be any html / string
         * @param {String} options.classNames - dialog css classnames, see "classNames parameter"
         * @param {Array} options.buttons - dialog buttons, see "buttons parameter"
         * @return {Dialog}
         */
        create(options = {appendTo: null}) {

            // create dialog element
            const dialogElement = document.createElement('dialog')
            dialogElement.id = 'html-dialog-' + Math.random().toString(36).substr(2, 9)
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
                            button[mouseEvent].call(this, event, this)
                        })
                    }
                })
            })

            // add event listener to form
            form = dialogElement.querySelector('form')
            form.addEventListener('submit', function (event) {
                event.preventDefault()
            })

            return this
        },
        /**
         * Open dialog.
         * @return {Dialog}
         */
        open() {
            try {
                dialog.showModal()

                // check for button focus
                buttons.forEach((button, index) => {
                    if (button.focus && button.focus === true) {
                        const buttonElement = dialog.querySelector(`button:nth-child(${index + 1})`)
                        buttonElement.focus({focusVisible: true})
                    }
                })

                return this
            } catch (error) {
                throw new Error('Dialog is not created or removed from DOM.')
            }
        },
        /**
         * Close dialog
         * @return {Dialog}
         */
        close() {
            dialog.close()
            return this
        },
        /**
         * Destroy dialog
         * @return {void}
         */
        destroy() {
            if (dialog && dialog.parentNode) {
                dialog.parentNode.removeChild(dialog)
            }
            delete this
        },
        /**
         * Get dialog element
         * @return {HTMLElement}
         */
        getDialog(Dialog) {
            return dialog
        },
        /**
         * Get the dialog form element
         * @return {HTMLElement}
         */
        getForm() {
            return form
        }
    }
}
