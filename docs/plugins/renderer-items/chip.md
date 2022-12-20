# ChipItem - `chip`

ChipItems render a single chip or tag, and have the following keys in addition to their required keys:

```typescript
{
    // Text to place inside tag
    "text"?: ValueItem,
    // Whether the chip is filled or not.
    // Defaults to false
    "filled"?: boolean,
    // Icon/Avatar to place in the chip.
    "avatar"?: AvatarType
}
```