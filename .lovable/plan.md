

## Fix Google Map and Add Directions to Footer

### Problem
1. The Google Maps embed on the Contact Us page uses incorrect/placeholder coordinates and doesn't point to the actual school location.
2. The Footer has no "Get Directions" link for visitors.

### Changes

#### 1. Contact Page -- Fix Google Maps Embed (`src/pages/Contact.tsx`)
- Replace the current placeholder iframe URL with the correct Google Maps embed for **Nethaji Vidhyalayam, S.Kolathur, Kovilambakkam, Chennai - 600129**.
- Use a place-based embed URL (`place/Nethaji+Vidhyalayam+S.Kolathur+Kovilambakkam+Chennai`) which lets Google resolve the exact pin.
- Also update the "Get Directions" links to use a more precise destination query: `Nethaji+Vidhyalayam,+S.Kolathur,+Kovilambakkam,+Chennai+600129`.

#### 2. Footer -- Add Directions Link (`src/components/layout/Footer.tsx`)
- In the "Contact Us" column of the footer, add a **"Get Directions"** link below the address.
- The link will open Google Maps directions to the school in a new tab.
- Styled consistently with the existing footer links using the accent color and an external link icon.

### Technical Details

**Contact page map fix** (line 199 in `src/pages/Contact.tsx`):
- Replace the embed `src` with: `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.4!2d80.1873!3d12.9188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sNethaji+Vidhyalayam!5e0!3m2!1sen!2sin` replaced by a `place` query embed: `https://www.google.com/maps/embed/v1/place?key=&q=Nethaji+Vidhyalayam,S.Kolathur,Kovilambakkam,Chennai+600129` or use the free embed approach: `https://maps.google.com/maps?q=Nethaji+Vidhyalayam,+S.Kolathur,+Kovilambakkam,+Chennai+600129&output=embed`

**Footer directions link** (in the address `<li>` block of `src/components/layout/Footer.tsx`):
- Add below the address text:
```tsx
<a
  href="https://www.google.com/maps/dir/?api=1&destination=Nethaji+Vidhyalayam,+S.Kolathur,+Kovilambakkam,+Chennai+600129"
  target="_blank"
  rel="noopener noreferrer"
  className="text-accent hover:underline text-xs inline-flex items-center gap-1 mt-1"
>
  Get Directions <ExternalLink className="h-3 w-3" />
</a>
```
- Import `ExternalLink` from lucide-react in Footer.

