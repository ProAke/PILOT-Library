import Link from "next/link";
import styles from "./category-tabs.module.css";

type Tab = { key: string; label: string; href: string };

type Props = {
  tabs: Tab[];
  active: string;
  label?: string;
};

/** The centred, underlined category switcher from the reference layout. */
export function CategoryTabs({ tabs, active, label = "หมวดหมู่สินค้า" }: Props) {
  return (
    <nav className={styles.tabs} aria-label={label}>
      <div className={`${styles.track} no-scrollbar`}>
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`${styles.tab} ${isActive ? styles.active : ""}`}
              aria-current={isActive ? "page" : undefined}
              scroll={false}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
