// Mock for lucide-react to avoid ESM issues in Jest
const React = require('react')

// Helper to create mock icon components
const createIconMock = name => {
  const IconComponent = props =>
    React.createElement('div', {
      'data-testid': `${name.toLowerCase()}-icon`,
      ...props
    })
  IconComponent.displayName = name
  return IconComponent
}

// Export all commonly used icons
module.exports = {
  __esModule: true,
  // Icons used in ErrorBoundary
  AlertTriangle: createIconMock('AlertTriangle'),
  RefreshCw: createIconMock('RefreshCw'),
  Home: createIconMock('Home'),
  Bug: createIconMock('Bug'),
  // Icons used in Services
  Crown: createIconMock('Crown'),
  Shield: createIconMock('Shield'),
  Sword: createIconMock('Sword'),
  Target: createIconMock('Target'),
  Star: createIconMock('Star'),
  Trophy: createIconMock('Trophy'),
  // Common icons
  Mail: createIconMock('Mail'),
  Lock: createIconMock('Lock'),
  User: createIconMock('User'),
  Phone: createIconMock('Phone'),
  Eye: createIconMock('Eye'),
  EyeOff: createIconMock('EyeOff'),
  AlertCircle: createIconMock('AlertCircle'),
  CheckCircle: createIconMock('CheckCircle'),
  Loader2: createIconMock('Loader2'),
  ArrowLeft: createIconMock('ArrowLeft'),
  ArrowRight: createIconMock('ArrowRight'),
  Search: createIconMock('Search'),
  Filter: createIconMock('Filter'),
  Check: createIconMock('Check'),
  X: createIconMock('X'),
  Plus: createIconMock('Plus'),
  Minus: createIconMock('Minus'),
  Menu: createIconMock('Menu'),
  ChevronLeft: createIconMock('ChevronLeft'),
  ChevronRight: createIconMock('ChevronRight'),
  ChevronUp: createIconMock('ChevronUp'),
  ChevronDown: createIconMock('ChevronDown'),
  Settings: createIconMock('Settings'),
  LogOut: createIconMock('LogOut'),
  Calendar: createIconMock('Calendar'),
  Clock: createIconMock('Clock'),
  MapPin: createIconMock('MapPin'),
  CreditCard: createIconMock('CreditCard'),
  Zap: createIconMock('Zap'),
  Award: createIconMock('Award'),
  Users: createIconMock('Users'),
  MessageCircle: createIconMock('MessageCircle'),
  Heart: createIconMock('Heart'),
  ExternalLink: createIconMock('ExternalLink'),
  Download: createIconMock('Download'),
  Upload: createIconMock('Upload'),
  Copy: createIconMock('Copy'),
  Trash: createIconMock('Trash'),
  Edit: createIconMock('Edit'),
  Info: createIconMock('Info'),
  HelpCircle: createIconMock('HelpCircle'),
  Bell: createIconMock('Bell'),
  Send: createIconMock('Send'),
  Sparkles: createIconMock('Sparkles'),
  Gift: createIconMock('Gift'),
  Flame: createIconMock('Flame'),
  Rocket: createIconMock('Rocket')
}
