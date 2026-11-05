import Link from "next/link";
import styles from "./hero.module.css";

type Props = {
  eyebrow?: string;
  title?: string;
  caption?: string;
  href?: string;
  cta?: string;
  src?: string;
  priority?: boolean;
};

/**
 * The full-bleed category banner from the reference layout: photograph on a
 * warm sand field, small caption block bottom-left with a hairline rail.
 */
export function Hero({
  eyebrow = "New Arrivals",
  title = "Aviation Essentials",
  caption = "A330 / 350 · Cabin Crew · Pilot",
  href = "/shop?c=accessories",
  cta = "Learn more",
  src = "/hero/cover.jpg",
  priority = true,
}: Props) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.frame}>
        <div className={styles.rail} aria-hidden="true" />
        <div className={styles.photoWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="คอลเลกชันสินค้า PILOT Library — กระเป๋า สายคล้องบัตร และของที่ระลึกการบิน"
            className={styles.photo}
            fetchPriority={priority ? "high" : "auto"}
          />
          <div className={styles.scrim} aria-hidden="true" />
        </div>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 id="hero-title" className={styles.title}>
            {title}
          </h1>
          <p className={styles.caption}>{caption}</p>
          <Link href={href} className={styles.cta}>
            {cta}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
