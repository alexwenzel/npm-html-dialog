/** Content that can be rendered into the dialog: plain text (default) or a DOM node. */
export type Content = string | Node

/** Handler map for arbitrary DOM events on a button, e.g. `{ mouseenter: (event, dialog) => {} }`. */
export type ButtonEventHandlers = {
    [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K], dialog: DialogInstance) => void
}

export interface ButtonOptions {
    /** Button label (rendered as text). */
    text: string
    /** Becomes the dialog's return value when this button closes it. */
    value?: string
    /**
     * `submit` closes the dialog natively (via `<form method="dialog">`) and runs form validation.
     * `button` does nothing on its own, use `onClick` and `dialog.close()`.
     * @default 'submit'
     */
    type?: 'submit' | 'button' | 'reset'
    /** Focus this button when the dialog opens. */
    autofocus?: boolean
    /** CSS class(es) for the button. */
    className?: string
    /** Click handler. Call `event.preventDefault()` to keep a submit button from closing the dialog. */
    onClick?: (event: MouseEvent, dialog: DialogInstance) => void
    /** Handlers for any other DOM event. */
    on?: ButtonEventHandlers
}

export interface DialogClassNames {
    dialog?: string
    title?: string
    content?: string
    buttons?: string
}

export interface DialogOptions {
    /** Dialog title. Also labels the dialog for assistive technology. */
    title?: Content
    /** Dialog body. Strings are inserted as text unless `html` is set. */
    content: Content
    /** Insert string `title` and `content` as HTML. Only enable for trusted input. */
    html?: boolean
    buttons?: ButtonOptions[]
    /**
     * ARIA role. Use `alertdialog` for messages that demand a response (confirmations, errors).
     * @default 'dialog'
     */
    role?: 'dialog' | 'alertdialog'
    /** `true` opens with `showModal()`, `false` with `show()`. @default true */
    modal?: boolean
    /** Allow closing with the Escape key. @default true */
    closeOnEscape?: boolean
    /** Close when the backdrop is clicked. @default false */
    closeOnBackdrop?: boolean
    /** Remove the dialog from the DOM after it closed. @default false */
    destroyOnClose?: boolean
    /** Element the dialog is appended to on first `open()`. @default document.body */
    appendTo?: Element
    /** CSS classes per part. */
    classNames?: DialogClassNames
    /** Called after the dialog opened. */
    onOpen?: (dialog: DialogInstance) => void
    /** Called before the dialog closes. Return `false` to keep it open. */
    beforeClose?: (returnValue: string, dialog: DialogInstance) => boolean | void
    /** Called after the dialog closed. */
    onClose?: (returnValue: string, dialog: DialogInstance) => void
}

export interface DialogInstance {
    /**
     * Opens the dialog (appending it to the DOM on first call).
     * Resolves with the return value once it closes: the clicked button's `value`, or `''` for Escape/backdrop.
     */
    open(): Promise<string>
    /** Closes the dialog. Respects `beforeClose`. */
    close(returnValue?: string): void
    /** Closes the dialog if needed, removes it from the DOM and detaches all listeners. */
    destroy(): void
    readonly element: HTMLDialogElement
    readonly form: HTMLFormElement
    readonly isOpen: boolean
}
