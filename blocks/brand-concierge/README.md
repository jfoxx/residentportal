# Brand Concierge Block

An interactive Q&A block that displays prompt cards and a free-form input. Users can click a prompt or type a question to view responses in a slide-up overlay.

## Setup

### 1. Create the brand-concierge workbook

Create a workbook at `/admin/brand-concierge` with two sheets (see [AEM Spreadsheets](https://www.aem.live/developer/spreadsheets)). Name them with the `shared-` prefix so they are exposed:

- **`shared-data`** – Prompt cards and their responses
- **`shared-keywords`** – Keyword-based responses for typed questions

The block fetches `/admin/brand-concierge.json`, which returns both sheets in [multi-sheet format](https://www.aem.live/developer/spreadsheets#multi-sheet-format).

**Data sheet** (prompt cards):

| Column    | Description                                                      |
|-----------|------------------------------------------------------------------|
| `prompt`  | The prompt text shown on the card                                |
| `response` | Path to the response content (e.g. `/admin/bc-responses/prompt1`) |

**Keywords sheet** (typed questions):

| Column    | Description                                                      |
|-----------|------------------------------------------------------------------|
| `keyword` | Keyword or phrase to match against the user's question          |
| `response` | Path to the response content (e.g. `/admin/bc-responses/closure`) |

- Each row with a non-empty `response` in the prompts sheet creates one card.
- When the user types a question, the block matches against the keywords sheet and loads the best match.

### 2. Create response content

Each response path should serve HTML with one of these structures:

- **`main` > two child `div`s** – First div is shown initially; second div after the user submits a follow-up.
- **`body` > two child `div`s** – Same behavior for plain.html responses.

## Block structure

The block expects two rows in the document:

1. **Row 1** – Title
2. **Row 2** – Subtitle

Prompt cards are populated from the `shared-data` sheet in the brand-concierge workbook; no prompt cards are authored on the page.

## Behavior

- **Prompt cards** – Clicking a card opens the overlay with that prompt's response (from `brand-concierge`).
- **Typed questions** – The block matches keywords in the question against the `keywords` sheet and loads the best match.
- **Two-section responses** – Section 1 shows first; section 2 appears after the user submits from the overlay input.
