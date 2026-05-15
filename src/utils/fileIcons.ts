import {
  File,
  FileCode2,
  FileJson2,
  FileText,
  FileImage,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const getFileIcon = (
  name: string,
): { Icon: LucideIcon; className: string } => {
  const ext = name.includes('.') ? name.split('.').pop()?.toLowerCase() : ''

  switch (ext) {
    case 'tsx':
    case 'ts':
    case 'jsx':
    case 'js':
      return { Icon: FileCode2, className: 'text-[#519aba]' }
    case 'json':
      return { Icon: FileJson2, className: 'text-[#cbcb41]' }
    case 'md':
    case 'txt':
      return { Icon: FileText, className: 'text-[#cccccc]' }
    case 'css':
      return { Icon: FileCode2, className: 'text-[#563d7c]' }
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
    case 'gif':
      return { Icon: FileImage, className: 'text-[#a074c4]' }
    default:
      if (name === 'package.json') {
        return { Icon: Settings, className: 'text-[#e37933]' }
      }
      return { Icon: File, className: 'text-vsc-icon-file' }
  }
}
