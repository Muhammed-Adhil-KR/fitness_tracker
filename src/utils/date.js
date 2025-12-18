export const formatDateDMY = (dateStr) => {
  if (!dateStr) return "--";

  const date = new Date(dateStr);
  if (isNaN(date)) return "--";

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${dd}-${mm}-${yyyy}`;
};
