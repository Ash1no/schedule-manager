import { ScheduleItem, Assignee, Tool } from '../types';

/**
 * Formats a schedule item into a final message using the user's custom template
 */
export function formatScheduleMessage(
  template: string,
  item: ScheduleItem,
  assignees: Assignee[],
  tools: Tool[]
): string {
  const assigneeName = item.assigneeId
    ? assignees.find((a) => a.id === item.assigneeId)?.name || 'Unassigned'
    : 'Unassigned';

  const toolName = item.toolId
    ? tools.find((t) => t.id === item.toolId)?.name || 'No Tool'
    : 'No Tool';

  // Fallback template if custom template is blank
  const defaultTemplate = `📅 Date: {date}\n📍 Location: {address}\n👤 Assignee: {assignee}\n🛠️ Tool: {tool}`;
  const baseText = template.trim() ? template : defaultTemplate;

  // Replace placeholders with real values
  return baseText
    .replace(/{date}/g, item.date)
    .replace(/{address}/g, item.address)
    .replace(/{assignee}/g, assigneeName)
    .replace(/{tool}/g, toolName);
}

/**
 * Creates a direct WhatsApp URL to open WhatsApp with pre-filled message text
 */
export function generateWhatsAppLink(message: string, phoneNumber?: string): string {
  const encodedMessage = encodeURIComponent(message);
  
  if (phoneNumber && phoneNumber.trim()) {
    // Strips non-digit characters for clean phone formatting
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }
  
  return `https://api.whatsapp.com/send?text=${encodedMessage}`;
}
