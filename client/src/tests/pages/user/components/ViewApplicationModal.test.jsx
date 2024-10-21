import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ViewApplicationModal from '../../../../pages/user/components/ViewApplicationModal'

describe('ViewApplicationModal', () => {
   const mockApplication = {
      applicationNumber: 'PMDQ-CSAW-2024-1020-000022',
      applicationType: 'Chainsaw Registration',
      status: 'Draft',
      dateOfSubmission: '1697760000000', // October 20, 2024
   }

   it('renders correctly with application data', () => {
      render(<ViewApplicationModal isOpen={true} onClose={() => { }} application={mockApplication} />)

      expect(screen.getByText('Application Details')).toBeInTheDocument()
      expect(screen.getByText('View the details of the application.')).toBeInTheDocument()
      expect(screen.getByText('PMDQ-CSAW-2024-1020-000022')).toBeInTheDocument()
      expect(screen.getByText('Chainsaw Registration')).toBeInTheDocument()
      expect(screen.getByText('Draft')).toBeInTheDocument()

      // Check for a valid date string without specifying the exact date
      const dateElement = screen.getByText(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2},\s\d{4}$/)
      expect(dateElement).toBeInTheDocument()
   })

   it('does not render when application is null', () => {
      const { container } = render(<ViewApplicationModal isOpen={true} onClose={() => { }} application={null} />)
      expect(container).toBeEmptyDOMElement()
   })

   it('calls onClose when dialog is closed', async () => {
      const onCloseMock = vi.fn()
      const user = userEvent.setup()

      render(<ViewApplicationModal isOpen={true} onClose={onCloseMock} application={mockApplication} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      expect(onCloseMock).toHaveBeenCalledTimes(1)
   })

   it('renders correctly when not open', () => {
      render(<ViewApplicationModal isOpen={false} onClose={() => { }} application={mockApplication} />)
      expect(screen.queryByText('Application Details')).not.toBeInTheDocument()
   })
})
