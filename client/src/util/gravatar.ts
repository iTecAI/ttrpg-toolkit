import { Md5 } from "ts-md5";

export function calculateGravatar(email: string, size?: number): string {
    const normal: string = email.toLowerCase().trim();
    const hashed: string = new Md5().appendStr(normal).end() as string;
    if (size) {
        return `https://www.gravatar.com/avatar/${hashed}?d=identicon&s=${size}`;
    } else {
        return `https://www.gravatar.com/avatar/${hashed}?d=identicon`;
    }
}
