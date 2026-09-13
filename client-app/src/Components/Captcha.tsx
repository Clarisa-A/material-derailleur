import { RefreshCw } from 'lucide-react';
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

interface CaptchaProps {
    onCaptchaGenerated: (captcha: string) => void;
    onCaptchaChange: (value: string) => void;
}

export interface CaptchaRef {
    resetCaptcha: () => void;
}

const Captcha = forwardRef<CaptchaRef, CaptchaProps>(
    ({ onCaptchaGenerated, onCaptchaChange }, ref) => {
        const [captcha, setCaptcha] = useState<string>('');
        const [captchaValue, setCaptchaValue] = useState<string>('');

        const captchaCanvasRef = useRef<HTMLCanvasElement | null>(null);

        useImperativeHandle(ref, () => ({
            resetCaptcha,
        }));

        const drawCaptcha = useCallback((text: string): void => {
            if (captchaCanvasRef.current) {
                const canvas = captchaCanvasRef.current;
                const ctx = canvas.getContext('2d');

                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    ctx.fillStyle = '#f3f3f3';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    for (let i = 0; i < 60; i++) {
                        ctx.fillStyle = `rgba(0,0,0, ${Math.random() * 0.6})`;
                        ctx.fillRect(
                            Math.random() * canvas.width,
                            Math.random() * canvas.height,
                            2,
                            2,
                        );
                    }

                    ctx.font = '20px Arial';
                    ctx.fillStyle = 'black';

                    // ctx.fillText(text, 10, 28);

                    const metrics = ctx.measureText(text);
                    const textWidth = metrics.width;

                    const baseX = (canvas.width - textWidth) / 2;
                    const baseY = canvas.height / 2;

                    let offsetX = baseX;
                    for (let i = 0; i < text.length; i++) {
                        const char = text[i];

                        const angle = (Math.random() - 0.5) * 0.6;
                        const jitterX = Math.random() * 4 - 2;
                        const jitterY = Math.random() * 6 - 3;
                        const fontSize = 20 + Math.random() * 6;

                        ctx.save();
                        ctx.translate(offsetX + jitterX, baseY + jitterY);
                        ctx.rotate(angle);

                        ctx.font = `${fontSize}px Arial`;
                        ctx.fillStyle = 'black';
                        ctx.fillText(char, 0, 0);

                        ctx.restore();
                        offsetX += ctx.measureText(char).width;
                    }
                }
            }
        }, []);

        // Generate random captcha and draw on canvas (original logic kept)
        const generateCaptcha = useCallback((): void => {
            const randomCaptcha = Math.random().toString(36).substring(7);
            setCaptcha(randomCaptcha);
            onCaptchaGenerated(randomCaptcha);
            drawCaptcha(randomCaptcha);
        }, [drawCaptcha]);

        useEffect(() => {
            generateCaptcha();
        }, [generateCaptcha]);

        const resetCaptcha = (): void => {
            generateCaptcha();
            setCaptchaValue('');
        };

        const handleCaptchaChange = (
            event: React.ChangeEvent<HTMLInputElement>,
        ): void => {
            const value = event.target.value;
            setCaptchaValue(value);
            onCaptchaChange(value);
        };

        return (
            <div>
                {/* Captcha */}
                <div className="captcha-container">
                    <div className="captcha-row">
                        <canvas
                            ref={captchaCanvasRef}
                            width="200"
                            height="40"
                        ></canvas>
                        <RefreshCw
                            className="refresh-icon"
                            size={20}
                            onClick={resetCaptcha}
                            aria-label="Refresh CAPTCHA"
                        />
                    </div>
                    <input
                        type="text"
                        className="captcha-input"
                        value={captchaValue}
                        onChange={handleCaptchaChange}
                        placeholder="Enter CAPTCHA"
                        id="captcha"
                        name="captcha"
                        required
                        // For mobile devices, prevent autofill and capitalization (captchas are random)
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                    />
                </div>
            </div>
        );
    },
);

export default Captcha;
