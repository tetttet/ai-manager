import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export function UserAvatar({
  imageUrl,
  initials,
  name,
}: {
  imageUrl?: string;
  initials: string;
  name: string;
}) {
  return (
    <Avatar className="size-8 rounded-lg">
      {imageUrl ? <AvatarImage src={imageUrl} alt={name} /> : null}
      <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
    </Avatar>
  );
}
