export function formatMessageTime(isoDate: string | null | undefined) {
  if (!isoDate) {
    return '';
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatConversationTimestamp(isoDate: string | null | undefined) {
  if (!isoDate) {
    return '';
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return formatMessageTime(isoDate);
  }

  return date.toLocaleDateString([], {
    day: '2-digit',
    month: '2-digit',
  });
}

export function formatFeedTimestamp(isoDate: string | null | undefined) {
  if (!isoDate) {
    return '';
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();

  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    ...(isSameDay ? {} : { day: '2-digit', month: 'short' }),
  }).format(date);
}
