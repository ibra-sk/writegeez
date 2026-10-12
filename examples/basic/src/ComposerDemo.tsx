import { useState } from "react";
import { GeezComposer } from "@writegeez/webui";
import "@writegeez/webui/styles.css";

export function ComposerDemo() {
	const [sent, setSent] = useState<string[]>([]);
	const [showToggle, setShowToggle] = useState(true);
	const [showSelect, setShowSelect] = useState(true);

	return (
		<div className="demo-stage">
			<div className="demo-options">
				<label className="demo-option">
					<input
						type="checkbox"
						checked={showToggle}
						onChange={(event) =>
							setShowToggle(event.target.checked)
						}
					/>
					showToggle
				</label>
				<label className="demo-option">
					<input
						type="checkbox"
						checked={showSelect}
						onChange={(event) =>
							setShowSelect(event.target.checked)
						}
					/>
					showSelect
				</label>
			</div>

			<div className="demo-stage__frame">
				<GeezComposer
					placeholder="Ask a Question.."
					showToggle={showToggle}
					showSelect={showSelect}
					onSubmit={(value) => setSent((all) => [value, ...all])}
				/>
			</div>

			{sent.length > 0 && (
				<ul className="demo-sent">
					{sent.map((entry, index) => (
						<li key={sent.length - index}>{entry}</li>
					))}
				</ul>
			)}
		</div>
	);
}
