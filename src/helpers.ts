import { createDialog } from './dialog'
import type { DialogOptions } from './types'

export interface HelperOptions extends Partial<Omit<DialogOptions, 'content' | 'buttons'>> {
    /** @default 'OK' */
    okText?: string
    /** @default 'Cancel' */
    cancelText?: string
}

export interface PromptOptions extends HelperOptions {
    defaultValue?: string
    /** Attributes set on the `<input>`, e.g. `{ type: 'email', required: '' }`. */
    inputAttributes?: Record<string, string>
}

const run = (
    content: DialogOptions['content'],
    buttons: DialogOptions['buttons'],
    options: HelperOptions,
) => {
    const { okText, cancelText, ...rest } = options
    return createDialog({ role: 'alertdialog', ...rest, content, buttons, destroyOnClose: true })
}

/** Shows a message with an OK button. Resolves when dismissed. */
export const alert = async (message: string, options: HelperOptions = {}): Promise<void> => {
    await run(message, [{ text: options.okText ?? 'OK', autofocus: true }], options).open()
}

/** Asks for confirmation. Resolves `true` for OK, `false` for Cancel/Escape/backdrop. */
export const confirm = async (message: string, options: HelperOptions = {}): Promise<boolean> => {
    const result = await run(
        message,
        [
            { text: options.cancelText ?? 'Cancel', value: 'cancel' },
            { text: options.okText ?? 'OK', value: 'ok', autofocus: true },
        ],
        options,
    ).open()
    return result === 'ok'
}

/** Asks for a text value. Resolves the entered string, or `null` if cancelled. */
export const prompt = async (message: string, options: PromptOptions = {}): Promise<string | null> => {
    const { defaultValue = '', inputAttributes = {}, ...rest } = options
    const label = document.createElement('label')
    const input = document.createElement('input')
    input.name = 'value'
    input.value = defaultValue
    input.autofocus = true
    for (const [name, value] of Object.entries(inputAttributes)) input.setAttribute(name, value)
    label.style.display = 'grid'
    label.append(message, input)

    const buttons = [
        // not a submit button: Enter in the input must trigger OK, and Cancel must skip validation
        {
            text: rest.cancelText ?? 'Cancel',
            type: 'button' as const,
            onClick: (_: MouseEvent, dialog: { close(value?: string): void }) => dialog.close('cancel'),
        },
        { text: rest.okText ?? 'OK', value: 'ok' },
    ]
    const result = await run(label, buttons, rest).open()
    return result === 'ok' ? input.value : null
}
