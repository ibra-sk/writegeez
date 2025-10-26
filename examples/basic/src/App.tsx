import { useEffect, useRef, useState } from "react";
import { GeezIME } from "@writegeez/ime";
import { InputMethodSpec, TigrinyaEritrean } from "@writegeez/ime";

export function App() {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const imeRef = useRef<InstanceType<typeof GeezIME> | null>(null);
	const [, forceRerender] = useState(0); // to refresh status text after toggles

	const spec: InputMethodSpec = TigrinyaEritrean;

	useEffect(() => {
		if (!textareaRef.current) return;

		// Create and attach IME to the textarea element
		const instance = new GeezIME(spec, textareaRef.current, {
			enabled: true,
		});
		imeRef.current = instance;

		// (Optional) clean-up: there's no explicit detach API yet.
		// Disabling stops the IME from modifying input, but listeners stay attached.
		// That’s fine for this demo since the component owns the textarea.
		return () => {
			try {
				instance.setEnabled(false);
			} catch {
				/* no-op */
			}
			imeRef.current = null;
		};
	}, [spec]);

	const isEnabled = imeRef.current?.isEnabled?.() ?? false;

	const onToggle = () => {
		const i = imeRef.current;
		if (!i) return;
		i.setEnabled(!i.isEnabled());
		forceRerender((x) => x + 1);
	};

	const onEnable = () => {
		imeRef.current?.setEnabled(true);
		forceRerender((x) => x + 1);
	};

	const onDisable = () => {
		imeRef.current?.setEnabled(false);
		forceRerender((x) => x + 1);
	};

	// Small helper UI to exercise processInput() directly
	const [prevChar, setPrevChar] = useState("");
	const [newChar, setNewChar] = useState("");
	const [procResult, setProcResult] = useState<{
		output: string;
		modifiesPrev: boolean;
	} | null>(null);

	const runProcessInput = () => {
		const i = imeRef.current;
		if (!i) return;
		const r = i.processInput(prevChar, newChar);
		setProcResult(r);
	};

	return (
		<div style={{ padding: 16, fontFamily: "system-ui", maxWidth: 720 }}>
			<h1>@writegeez/ime – demo</h1>

			<section style={{ marginTop: 16 }}>
				<label style={{ display: "block", marginBottom: 8 }}>
					Type here (try: <code>h</code> then <code>a</code>, or{" "}
					<code>b</code>):
				</label>
				<textarea
					ref={textareaRef}
					rows={4}
					style={{ width: "100%", padding: 8, fontSize: 16 }}
					placeholder="Try typing 'h' then 'a' → should become ሀ"
				/>
				<div style={{ marginTop: 8 }}>
					<button onClick={onEnable}>Enable</button>
					<button onClick={onDisable} style={{ marginLeft: 8 }}>
						Disable
					</button>
					<button onClick={onToggle} style={{ marginLeft: 8 }}>
						Toggle
					</button>
					<span style={{ marginLeft: 12 }}>
						Status:{" "}
						<strong>{isEnabled ? "Enabled" : "Disabled"}</strong>
					</span>
				</div>
				<div style={{ marginTop: 4, color: "#666" }}>
					<code>data-ime-enabled</code> on the textarea will reflect
					the state.
				</div>
			</section>

			<section style={{ marginTop: 24 }}>
				<h2 style={{ fontSize: 18 }}>processInput() quick check</h2>
				<div
					style={{
						display: "flex",
						gap: 8,
						alignItems: "center",
						flexWrap: "wrap",
					}}
				>
					<label>
						Prev char:&nbsp;
						<input
							value={prevChar}
							onChange={(e) => setPrevChar(e.target.value)}
							style={{ width: 80 }}
						/>
					</label>
					<label>
						New char:&nbsp;
						<input
							value={newChar}
							onChange={(e) => setNewChar(e.target.value)}
							style={{ width: 80 }}
						/>
					</label>
					<button onClick={runProcessInput}>Run</button>
				</div>
				{procResult && (
					<pre
						style={{
							background: "#111",
							color: "#0f0",
							padding: 12,
							marginTop: 8,
						}}
					>
						{JSON.stringify(procResult, null, 2)}
					</pre>
				)}
				<div style={{ marginTop: 8, color: "#555" }}>
					Try prev=<code>h</code> and new=<code>a</code> → expects{" "}
					<code>{`{ output: "ሀ", modifiesPrev: true }`}</code>
				</div>
			</section>

		</div>
	);
}
