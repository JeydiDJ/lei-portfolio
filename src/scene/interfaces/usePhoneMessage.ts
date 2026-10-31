import { useCallback, useEffect, useRef, useState } from "react";
import { profile } from "../../data/portfolio";
import { rect, text, wrap } from "./drawing";
import { control, icon } from "./osDrawing";
import type { SurfaceDraw } from "./useObjectSurface";

type Field = "name" | "email" | "message";
const fields = ["name", "email", "message"] as const;
const labels = { name: "Your name", email: "Your email", message: "Message" };
// Match the Contacts app drawn by ContactPhone, including its Message accent.
const phone = {
  ink: "#202124",
  muted: "#757575",
  accent: "#3b76bd",
  line: "#ededed",
};

/** Only native text entry lives in the DOM; every visible control is drawn on the phone. */
export default function usePhoneMessage(active: boolean, onBack: () => void) {
  const inputs = useRef<
    Partial<Record<Field, HTMLInputElement | HTMLTextAreaElement>>
  >({});
  const values = useRef({ name: "", email: "", message: "" });
  const [draft, setDraft] = useState(values.current);
  const [focused, setFocused] = useState<Field | null>(null);
  const [notice, setNotice] = useState("");
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  useEffect(() => {
    if (!active) return;
    const form = document.createElement("form");
    form.setAttribute("aria-label", "Message Lei on the phone");
    // Keep native editing, autofill, IME and mobile keyboards without a second visible UI.
    Object.assign(form.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      width: "1px",
      height: "1px",
      opacity: "0",
      overflow: "hidden",
      pointerEvents: "none",
    });
    const syncSelection = (
      field: Field,
      input: HTMLInputElement | HTMLTextAreaElement,
    ) => {
      setSelection({
        start: input.selectionStart ?? input.value.length,
        end: input.selectionEnd ?? input.value.length,
      });
      setFocused(field);
    };
    for (const field of fields) {
      const input =
        field === "message"
          ? document.createElement("textarea")
          : document.createElement("input");
      input.name = field;
      input.setAttribute("aria-label", labels[field]);
      input.required = true;
      input.maxLength =
        field === "message" ? 2000 : field === "name" ? 100 : 254;
      input.autocomplete = field === "message" ? "off" : field;
      if (input instanceof HTMLInputElement) {
        // Text type preserves selection APIs; email inputMode still provides the email keyboard.
        input.inputMode = field === "email" ? "email" : "text";
      }
      input.value = values.current[field];
      input.oninput = () => {
        values.current = { ...values.current, [field]: input.value };
        setDraft(values.current);
        setNotice("");
        syncSelection(field, input);
      };
      input.onfocus = () => syncSelection(field, input);
      input.onselect = () => syncSelection(field, input);
      input.onkeyup = () => syncSelection(field, input);
      input.onblur = () => setFocused(null);
      inputs.current[field] = input;
      form.appendChild(input);
    }
    form.onkeydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onBack();
      } else if (
        event.key === "Enter" &&
        !(event.target instanceof HTMLTextAreaElement)
      ) {
        event.preventDefault();
        const index = fields.indexOf(
          (event.target as HTMLInputElement).name as Field,
        );
        inputs.current[fields[index + 1]]?.focus({ preventScroll: true });
      }
      event.stopPropagation();
    };
    form.onsubmit = (event) => event.preventDefault();
    document.querySelector(".scene-container")?.appendChild(form);
    return () => {
      form.remove();
      inputs.current = {};
      setFocused(null);
    };
  }, [active, onBack]);

  const focus = useCallback((field: Field) => {
    const input = inputs.current[field];
    input?.focus({ preventScroll: true });
  }, []);

  const submit = useCallback(() => {
    const { name, email, message } = values.current;
    const invalid = !name.trim()
      ? "name"
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? "email"
        : !message.trim()
          ? "message"
          : null;
    if (invalid) {
      setNotice(
        invalid === "email"
          ? "Enter a valid email address."
          : `Please fill in ${labels[invalid].toLowerCase()}.`,
      );
      focus(invalid);
      return;
    }
    (document.activeElement as HTMLElement)?.blur();
    const subject = encodeURIComponent(`Portfolio message from ${name.trim()}`);
    const body = encodeURIComponent(
      `${message.trim()}\n\nFrom: ${name.trim()}\nReply to: ${email.trim()}`,
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setNotice("Finish sending in your email app. Your draft stays here.");
  }, [focus]);

  const draw = useCallback<SurfaceDraw>(
    (c, actions, ui) => {
      control(
        c,
        actions,
        ui,
        "Back to Lei's contact",
        [30, 86, 72, 72],
        onBack,
        { icon: "back", iconSize: 40 },
      );
      // One UI's expanded app header and inset cards mirror the Contacts list.
      text(c, "New message", 48, 304, 76, phone.ink, 600);
      rect(c, 28, 366, 664, 122, "#ffffff", 30);
      rect(c, 53, 391, 72, 72, "#e7dfe1", 36);
      icon(c, "person", 69, 407, 40, phone.muted);
      text(c, "Lei", 151, 413, 34, phone.ink, 500);
      text(c, profile.email, 151, 454, 28, phone.muted);
      rect(c, 28, 510, 664, 662, "#ffffff", 30);
      const tops = { name: 580, email: 760, message: 940 };
      for (const field of fields) {
        const top = tops[field];
        const height = field === "message" ? 205 : 100;
        const selected = focused === field;
        const action = `Edit ${labels[field].toLowerCase()}`;
        if (ui.hover(action) > 0) {
          c.save();
          c.globalAlpha = ui.hover(action) * 0.04;
          rect(c, 40, top - 46, 640, height + 50, phone.ink, 20);
          c.restore();
        }
        text(
          c,
          labels[field],
          55,
          top - 22,
          26,
          selected ? phone.accent : phone.muted,
        );
        rect(
          c,
          55,
          top + height - 3,
          610,
          selected ? 3 : 1,
          selected ? phone.accent : phone.line,
        );
        c.save();
        c.beginPath();
        c.rect(55, top + 12, 610, height - 24);
        c.clip();
        c.font = '32px "DM Sans",sans-serif';
        const value = draft[field];
        const rows: { value: string; start: number }[] = [];
        let row = "",
          start = 0;
        // Character wrapping handles pasted URLs and explicit newlines too.
        for (let i = 0; i < value.length; i++) {
          const char = value[i];
          if (char === "\n" || c.measureText(row + char).width > 598) {
            rows.push({ value: row, start });
            row = char === "\n" ? "" : char;
            start = char === "\n" ? i + 1 : i;
          } else row += char;
        }
        rows.push({ value: row, start });
        const caret = Math.min(selection.end, value.length);
        let caretRow = rows.findIndex(
          (line, i) =>
            caret >= line.start &&
            (i === rows.length - 1 || caret < rows[i + 1].start),
        );
        caretRow = Math.max(0, caretRow);
        const count = field === "message" ? 4 : 1;
        const first = selected ? Math.max(0, caretRow - count + 1) : 0;
        if (!value)
          text(
            c,
            field === "message"
              ? "Write your message…"
              : field === "email"
                ? "you@example.com"
                : "Your name",
            55,
            top + 58,
            32,
            "#888080",
          );
        rows.slice(first, first + count).forEach((line, i) => {
          const y = top + 56 + i * 43;
          const from = Math.max(selection.start, line.start);
          const to = Math.min(selection.end, line.start + line.value.length);
          if (selected && to > from) {
            rect(
              c,
              55 + c.measureText(line.value.slice(0, from - line.start)).width,
              y - 31,
              c.measureText(
                line.value.slice(from - line.start, to - line.start),
              ).width,
              39,
              "#dce8f6",
            );
          }
          text(c, line.value, 55, y, 32, phone.ink);
          if (selected && first + i === caretRow) {
            const x =
              55 + c.measureText(line.value.slice(0, caret - line.start)).width;
            rect(c, x, y - 31, 2, 39, phone.accent);
          }
        });
        c.restore();
        actions.push({
          label: action,
          rect: [40, top - 46, 640, height + 50],
          run: () => focus(field),
        });
      }
      text(c, `${draft.message.length}/2000`, 530, 1208, 24, phone.muted);
      wrap(
        c,
        notice || "Opens your email app. Send your message there.",
        55,
        1252,
        610,
        26,
        32,
        notice ? phone.accent : phone.muted,
      );
      control(
        c,
        actions,
        ui,
        "Continue to email",
        [150, 1320, 420, 80],
        submit,
        { text: "Continue to email", fill: phone.accent, font: 30, radius: 40 },
      );
    },
    [draft, focused, selection, notice, focus, submit, onBack],
  );
  return draw;
}
