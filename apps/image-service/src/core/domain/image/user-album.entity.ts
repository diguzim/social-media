export interface UserAlbumProps {
  id: string;
  ownerUserId: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class UserAlbum {
  id: string;
  ownerUserId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date | null;

  constructor(props: UserAlbumProps) {
    this.id = props.id;
    this.ownerUserId = props.ownerUserId;
    this.name = props.name;
    this.description = props.description ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt ?? null;
  }
}
