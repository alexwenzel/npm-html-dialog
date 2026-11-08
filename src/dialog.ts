import type { ButtonOptions, Content, DialogInstance, DialogOptions } from './types'

let uid = 0

const fill = (target: HTMLElement, content: Content, html?: boolean) => {
    if (typeof content !== 'string') target.append(content)
    else if (html) target.innerHTML = content
    else target.textContent = content
}

const createButton = (options: ButtonOptions, dialog: DialogInstance, signal: AbortSignal) => {
    const button = document.createElement('button')
    button.type = options.type ?? 'submit'
    button.textContent = options.text
    if (options.value !== undefined) button.value = options.value
    if (options.autofocus) button.autofocus = true
    if (options.className) button.className = options.className

    // the public types tie each event name to its event type; internally any handler receives an Event
    const handlers = { click: options.onClick, ...options.on } as unknown as Record<
        string,
        ((event: Event, dialog: DialogInstance) => void) | undefined
    >
    for (const [type, handler] of Object.entries(handlers)) {
        if (handler) button.addEventListener(type, (event) => handler(event, dialog), { signal })
    }
    return button
}

export const createDialog = (options: DialogOptions): DialogInstance => {
    if (options.content == null) throw new Error('html-dialog: "content" is required')

    const { classNames = {}, modal = true, closeOnEscape = true, html } = options
    const id = `html-dialog-${++uid}`
    const abort = new AbortController()
    const { signal } = abort

    const element = document.createElement('dialog')
    const form = document.createElement('form')
    form.method = 'dialog'
    element.className = classNames.dialog ?? ''
    if (options.role) element.setAttribute('role', options.role)
    element.append(form)

    const addPart = (content: Content, className = '', part: string) => {
        const el = document.createElement('div')
        el.id = `${id}-${part}`
        el.className = className
        fill(el, content, html)
        form.append(el)
        return el
    }

    if (options.title != null) {
        element.setAttribute('aria-labelledby', addPart(options.title, classNames.title, 'title').id)
    }
    element.setAttribute('aria-describedby', addPart(options.content, classNames.content, 'content').id)

    let pending: Promise<string> | undefined
    let resolve: ((returnValue: string) => void) | undefined
    let destroyed = false

    const assertAlive = () => {
        if (destroyed) throw new Error('html-dialog: dialog has been destroyed')
    }

    const settle = () => {
        const { returnValue } = element
        const done = resolve
        pending = resolve = undefined
        done?.(returnValue)
        options.onClose?.(returnValue, instance)
    }

    const allowsClose = (returnValue: string) => options.beforeClose?.(returnValue, instance) !== false

    const destroy = () => {
        if (destroyed) return
        const wasOpen = element.open
        if (wasOpen) element.close()
        destroyed = true
        abort.abort()
        element.remove()
        if (wasOpen) settle()
    }

    const instance: DialogInstance = {
        element,
        form,
        get isOpen() {
            return element.open
        },
        open() {
            assertAlive()
            if (pending) return pending
            if (!element.isConnected) (options.appendTo ?? document.body).append(element)
            element.returnValue = ''
            pending = new Promise((done) => (resolve = done))
            if (modal) element.showModal()
            else element.show()
            options.onOpen?.(instance)
            return pending
        },
        close(returnValue = '') {
            assertAlive()
            if (element.open && allowsClose(returnValue)) element.close(returnValue)
        },
        destroy,
    }

    if (options.buttons?.length) {
        const actions = document.createElement('div')
        actions.className = classNames.buttons ?? ''
        actions.append(...options.buttons.map((b) => createButton(b, instance, signal)))
        form.append(actions)
    }

    form.addEventListener(
        'submit',
        (event) => {
            if (!allowsClose((event.submitter as HTMLButtonElement | null)?.value ?? '')) {
                event.preventDefault()
            }
        },
        { signal },
    )

    element.addEventListener(
        'cancel',
        (event) => {
            if (!closeOnEscape || !allowsClose('')) event.preventDefault()
        },
        { signal },
    )

    element.addEventListener(
        'close',
        () => {
            settle()
            if (options.destroyOnClose) destroy()
        },
        { signal },
    )

    if (options.closeOnBackdrop) {
        element.addEventListener(
            'click',
            (event) => {
                if (event.target !== element) return
                // clicks on the dialog's own padding also target the element, so compare against its box
                const box = element.getBoundingClientRect()
                const outside =
                    event.clientX < box.left ||
                    event.clientX > box.right ||
                    event.clientY < box.top ||
                    event.clientY > box.bottom
                if (outside) instance.close()
            },
            { signal },
        )
    }

    return instance
}
