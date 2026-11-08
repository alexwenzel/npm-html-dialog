import { afterEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createDialog } from '../src'

afterEach(() => {
    document.querySelectorAll('dialog').forEach((d) => d.remove())
})

const buttonOf = (dialog: { element: HTMLDialogElement }, text: string) =>
    [...dialog.element.querySelectorAll('button')].find((b) => b.textContent === text)!

describe('structure', () => {
    it('requires content', () => {
        // @ts-expect-error content is required
        expect(() => createDialog({})).toThrow(/content/)
    })

    it('builds title, content and buttons inside a method=dialog form', () => {
        const d = createDialog({ title: 'T', content: 'C', buttons: [{ text: 'OK' }] })
        expect(d.form.method).toContain('dialog')
        expect(d.form.children).toHaveLength(3)
        expect(d.form.textContent).toContain('TC')
        expect(d.element.isConnected).toBe(false)
    })

    it('supports the alertdialog role', () => {
        expect(createDialog({ content: 'C', role: 'alertdialog' }).element.getAttribute('role')).toBe(
            'alertdialog',
        )
        expect(createDialog({ content: 'C' }).element.hasAttribute('role')).toBe(false)
    })

    it('omits title and buttons when not given', () => {
        const d = createDialog({ content: 'C' })
        expect(d.form.children).toHaveLength(1)
        expect(d.element.hasAttribute('aria-labelledby')).toBe(false)
    })

    it('links title and content via aria attributes', () => {
        const d = createDialog({ title: 'T', content: 'C' })
        const labelledBy = d.element.getAttribute('aria-labelledby')!
        const describedBy = d.element.getAttribute('aria-describedby')!
        expect(d.form.querySelector(`#${labelledBy}`)?.textContent).toBe('T')
        expect(d.form.querySelector(`#${describedBy}`)?.textContent).toBe('C')
    })

    it('renders strings as text, never as HTML', () => {
        const d = createDialog({ title: '<b>t</b>', content: '<img src=x onerror="window.__xss=1">' })
        expect(d.element.querySelector('b, img')).toBeNull()
        expect(d.form.textContent).toContain('<b>t</b>')
    })

    it('renders strings as HTML with html: true', () => {
        const d = createDialog({ content: '<em>hi</em>', html: true })
        expect(d.element.querySelector('em')?.textContent).toBe('hi')
    })

    it('accepts DOM nodes as content and title', () => {
        const node = document.createElement('input')
        const d = createDialog({ title: document.createElement('h1'), content: node })
        expect(d.element.contains(node)).toBe(true)
        expect(d.element.querySelector('h1')).not.toBeNull()
    })

    it('applies class names without leaking "undefined"', () => {
        const d = createDialog({
            title: 'T',
            content: 'C',
            buttons: [{ text: 'OK', className: 'btn' }],
            classNames: { dialog: 'dlg', buttons: 'actions' },
        })
        expect(d.element.className).toBe('dlg')
        expect(d.form.querySelector('.actions button.btn')).not.toBeNull()
        expect(d.element.outerHTML).not.toContain('undefined')
    })

    it('sets button type, value and autofocus', () => {
        const d = createDialog({
            content: 'C',
            buttons: [{ text: 'A' }, { text: 'B', type: 'button', value: 'b', autofocus: true }],
        })
        expect(buttonOf(d, 'A').type).toBe('submit')
        const b = buttonOf(d, 'B')
        expect([b.type, b.value, b.autofocus]).toEqual(['button', 'b', true])
    })
})

describe('open and close', () => {
    it('appends to body on first open and opens modally', async () => {
        const d = createDialog({ content: 'C' })
        void d.open()
        expect(d.element.parentElement).toBe(document.body)
        expect(d.isOpen).toBe(true)
        expect(d.element.matches(':modal')).toBe(true)
    })

    it('appends to a custom element', () => {
        const host = document.body.appendChild(document.createElement('section'))
        const d = createDialog({ content: 'C', appendTo: host })
        void d.open()
        expect(d.element.parentElement).toBe(host)
        host.remove()
    })

    it('works inside a shadow root', () => {
        const host = document.body.appendChild(document.createElement('div'))
        const root = host.attachShadow({ mode: 'open' })
        const d = createDialog({ content: 'C', appendTo: root as unknown as Element })
        void d.open()
        expect(d.element.getRootNode()).toBe(root)
        expect(d.isOpen).toBe(true)
        host.remove()
    })

    it('opens non-modally with modal: false', () => {
        const d = createDialog({ content: 'C', modal: false })
        void d.open()
        expect(d.isOpen).toBe(true)
        expect(d.element.matches(':modal')).toBe(false)
    })

    it('resolves with the clicked button value', async () => {
        const d = createDialog({
            content: 'C',
            buttons: [
                { text: 'No', value: 'no' },
                { text: 'Yes', value: 'yes' },
            ],
        })
        const result = d.open()
        await userEvent.click(buttonOf(d, 'Yes'))
        expect(await result).toBe('yes')
        expect(d.isOpen).toBe(false)
    })

    it('returns the same promise while already open', () => {
        const d = createDialog({ content: 'C' })
        expect(d.open()).toBe(d.open())
    })

    it('can be reopened and resets the return value', async () => {
        const d = createDialog({ content: 'C', buttons: [{ text: 'OK', value: 'ok' }] })
        let result = d.open()
        d.close('first')
        expect(await result).toBe('first')
        result = d.open()
        d.close()
        expect(await result).toBe('')
    })

    it('close() is a no-op when closed', () => {
        const d = createDialog({ content: 'C' })
        expect(() => d.close()).not.toThrow()
    })
})

describe('closing rules', () => {
    it('resolves with an empty string on Escape', async () => {
        const d = createDialog({ content: 'C', buttons: [{ text: 'OK', value: 'ok' }] })
        const result = d.open()
        await userEvent.keyboard('{Escape}')
        expect(await result).toBe('')
    })

    it('ignores Escape with closeOnEscape: false', async () => {
        const d = createDialog({ content: 'C', closeOnEscape: false })
        void d.open()
        await userEvent.keyboard('{Escape}')
        expect(d.isOpen).toBe(true)
    })

    it('closes on backdrop click only when enabled', () => {
        const off = createDialog({ content: 'C' })
        void off.open()
        off.element.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: -5, clientY: -5 }))
        expect(off.isOpen).toBe(true)

        const on = createDialog({ content: 'C', closeOnBackdrop: true })
        void on.open()
        on.element.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: -5, clientY: -5 }))
        expect(on.isOpen).toBe(false)
    })

    it('does not close when the dialog padding or content is clicked', async () => {
        const d = createDialog({ content: 'C', closeOnBackdrop: true })
        void d.open()
        const box = d.element.getBoundingClientRect()
        d.element.dispatchEvent(
            new MouseEvent('click', { bubbles: true, clientX: box.left + 1, clientY: box.top + 1 }),
        )
        expect(d.isOpen).toBe(true)
        d.form.firstElementChild!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(d.isOpen).toBe(true)
    })

    it('beforeClose can veto close(), Escape and submit', async () => {
        const beforeClose = vi.fn<(returnValue: string) => boolean>(() => false)
        const d = createDialog({ content: 'C', beforeClose, buttons: [{ text: 'OK', value: 'ok' }] })
        void d.open()
        d.close('x')
        await userEvent.keyboard('{Escape}')
        await userEvent.click(buttonOf(d, 'OK'))
        expect(d.isOpen).toBe(true)
        expect(beforeClose.mock.calls.map(([value]) => value)).toEqual(['x', '', 'ok'])
    })

    it('beforeClose lets the dialog close when it returns nothing', async () => {
        const d = createDialog({ content: 'C', beforeClose: () => {} })
        const result = d.open()
        d.close('done')
        expect(await result).toBe('done')
    })
})

describe('callbacks and events', () => {
    it('calls onOpen and onClose in order with the instance', async () => {
        const calls: string[] = []
        const d = createDialog({
            content: 'C',
            onOpen: (dialog) => calls.push(`open:${dialog === d}`),
            onClose: (value, dialog) => calls.push(`close:${value}:${dialog === d}`),
        })
        const result = d.open()
        d.close('v')
        await result
        expect(calls).toEqual(['open:true', 'close:v:true'])
    })

    it('onClick receives event and dialog and can keep the dialog open', async () => {
        const onClick = vi.fn((event: MouseEvent) => event.preventDefault())
        const d = createDialog({ content: 'C', buttons: [{ text: 'OK', onClick }] })
        void d.open()
        await userEvent.click(buttonOf(d, 'OK'))
        expect(onClick).toHaveBeenCalledWith(expect.any(MouseEvent), d)
        expect(d.isOpen).toBe(true)
    })

    it('supports arbitrary events through "on"', () => {
        const mouseenter = vi.fn()
        const keydown = vi.fn()
        const d = createDialog({ content: 'C', buttons: [{ text: 'OK', on: { mouseenter, keydown } }] })
        const button = buttonOf(d, 'OK')
        button.dispatchEvent(new MouseEvent('mouseenter'))
        button.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
        expect(mouseenter).toHaveBeenCalledWith(expect.any(MouseEvent), d)
        expect(keydown).toHaveBeenCalledWith(expect.any(KeyboardEvent), d)
    })

    it('onClick can close the dialog via the instance', async () => {
        const d = createDialog({
            content: 'C',
            buttons: [{ text: 'X', type: 'button', onClick: (_, dialog) => dialog.close('custom') }],
        })
        const result = d.open()
        await userEvent.click(buttonOf(d, 'X'))
        expect(await result).toBe('custom')
    })
})

describe('forms and focus', () => {
    it('blocks closing while native validation fails', async () => {
        const input = Object.assign(document.createElement('input'), { required: true })
        const d = createDialog({ content: input, buttons: [{ text: 'OK', value: 'ok' }] })
        void d.open()
        await userEvent.click(buttonOf(d, 'OK'))
        expect(d.isOpen).toBe(true)
        await userEvent.fill(input, 'filled')
        await userEvent.click(buttonOf(d, 'OK'))
        expect(d.isOpen).toBe(false)
    })

    it('focuses the autofocus button on open', () => {
        const d = createDialog({
            content: 'C',
            buttons: [{ text: 'A' }, { text: 'B', autofocus: true }],
        })
        void d.open()
        expect(document.activeElement).toBe(buttonOf(d, 'B'))
    })
})

describe('destroy', () => {
    it('removes the element and rejects further use', () => {
        const d = createDialog({ content: 'C' })
        void d.open()
        d.destroy()
        expect(d.element.isConnected).toBe(false)
        expect(() => d.open()).toThrow(/destroyed/)
        expect(() => d.close()).toThrow(/destroyed/)
        expect(() => d.destroy()).not.toThrow()
    })

    it('resolves a pending open() and calls onClose', async () => {
        const onClose = vi.fn()
        const d = createDialog({ content: 'C', onClose })
        const result = d.open()
        d.destroy()
        expect(await result).toBe('')
        expect(onClose).toHaveBeenCalledOnce()
    })

    it('destroys itself after closing with destroyOnClose', async () => {
        const d = createDialog({ content: 'C', destroyOnClose: true })
        const result = d.open()
        d.close('x')
        expect(await result).toBe('x')
        expect(d.element.isConnected).toBe(false)
        expect(() => d.open()).toThrow(/destroyed/)
    })

    it('detaches button listeners', () => {
        const onClick = vi.fn()
        const d = createDialog({ content: 'C', buttons: [{ text: 'OK', onClick }] })
        const button = buttonOf(d, 'OK')
        d.destroy()
        button.click()
        expect(onClick).not.toHaveBeenCalled()
    })
})
