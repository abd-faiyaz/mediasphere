import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '@/components/ui/textarea'

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('Textarea Component', () => {
  it('renders textarea', () => {
    render(<Textarea data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toBeInTheDocument()
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('applies default classes', () => {
    render(<Textarea data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass(
      'flex',
      'min-h-[80px]',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-background',
      'px-3',
      'py-2',
      'text-base'
    )
  })

  it('applies custom className', () => {
    render(<Textarea className="custom-class" data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Textarea ref={ref} />)
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement))
  })

  it('handles value changes', async () => {
    const user = userEvent.setup()
    render(<Textarea data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement
    
    await user.type(textarea, 'test content')
    expect(textarea.value).toBe('test content')
  })

  it('handles multiline text', async () => {
    const user = userEvent.setup()
    render(<Textarea data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement
    
    await user.type(textarea, 'line 1{enter}line 2{enter}line 3')
    expect(textarea.value).toBe('line 1\nline 2\nline 3')
  })

  it('handles onChange event', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(<Textarea onChange={handleChange} data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    
    await user.type(textarea, 'a')
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('handles onFocus event', async () => {
    const user = userEvent.setup()
    const handleFocus = jest.fn()
    render(<Textarea onFocus={handleFocus} data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    
    await user.click(textarea)
    expect(handleFocus).toHaveBeenCalledTimes(1)
  })

  it('handles onBlur event', async () => {
    const user = userEvent.setup()
    const handleBlur = jest.fn()
    render(<Textarea onBlur={handleBlur} data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    
    await user.click(textarea)
    await user.tab()
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('displays placeholder text', () => {
    render(<Textarea placeholder="Enter your message" data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('placeholder', 'Enter your message')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Textarea disabled data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toBeDisabled()
  })

  it('is readonly when readOnly prop is true', () => {
    render(<Textarea readOnly data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('readonly')
  })

  it('handles controlled textarea with value prop', () => {
    const { rerender } = render(<Textarea value="initial content" data-testid="textarea" onChange={() => {}} />)
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement
    expect(textarea.value).toBe('initial content')
    
    rerender(<Textarea value="updated content" data-testid="textarea" onChange={() => {}} />)
    expect(textarea.value).toBe('updated content')
  })

  it('handles defaultValue prop', () => {
    render(<Textarea defaultValue="default content" data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement
    expect(textarea.value).toBe('default content')
  })

  it('handles required attribute', () => {
    render(<Textarea required data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('required')
  })

  it('handles name attribute', () => {
    render(<Textarea name="message" data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('name', 'message')
  })

  it('handles id attribute', () => {
    render(<Textarea id="user-message" data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('id', 'user-message')
  })

  it('handles rows attribute', () => {
    render(<Textarea rows={5} data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('rows', '5')
  })

  it('handles cols attribute', () => {
    render(<Textarea cols={40} data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('cols', '40')
  })

  it('handles maxLength attribute', () => {
    render(<Textarea maxLength={100} data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('maxLength', '100')
  })

  it('handles aria attributes', () => {
    render(
      <Textarea 
        aria-label="Message input" 
        aria-describedby="message-help" 
        data-testid="textarea" 
      />
    )
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('aria-label', 'Message input')
    expect(textarea).toHaveAttribute('aria-describedby', 'message-help')
  })

  it('handles keyboard events', () => {
    const handleKeyDown = jest.fn()
    const handleKeyUp = jest.fn()
    render(<Textarea onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    
    fireEvent.keyDown(textarea, { key: 'Enter' })
    fireEvent.keyUp(textarea, { key: 'Enter' })
    
    expect(handleKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: 'Enter' }))
    expect(handleKeyUp).toHaveBeenCalledWith(expect.objectContaining({ key: 'Enter' }))
  })

  it('handles form submission', () => {
    const handleSubmit = jest.fn((e) => e.preventDefault())
    render(
      <form onSubmit={handleSubmit}>
        <Textarea data-testid="textarea" />
        <button type="submit">Submit</button>
      </form>
    )
    
    const textarea = screen.getByTestId('textarea')
    const button = screen.getByRole('button', { name: 'Submit' })
    
    fireEvent.change(textarea, { target: { value: 'test message' } })
    fireEvent.click(button)
    
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it('handles resize attribute', () => {
    render(<Textarea style={{ resize: 'vertical' }} data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveStyle('resize: vertical')
  })

  it('handles wrap attribute', () => {
    render(<Textarea wrap="hard" data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('wrap', 'hard')
  })
})
