import { Md5 } from "ts-md5";

export function calculateGravatar(email: string): string {
    const normal: string = email.toLowerCase().trim();
    const hashed: string = new Md5().appendStr(normal).end() as string;
    return `https://www.gravatar.com/avatar/${hashed}?d=identicon`;
}
