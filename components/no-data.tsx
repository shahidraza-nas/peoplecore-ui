import Image from "next/image";

interface NoDataProps {
  title: string;
  description: string;
  showBtn?: boolean;
  url?: string;
  btnTitle?: string;
}

export default function NoData({
  title,
  description,
  showBtn,
  url,
  btnTitle,
}: NoDataProps) {
  return (
    <div className="w-full flex items-center justify-center gap-10 mt-10 py-8">
      <div className="grid gap-4 w-60">
        <Image
          src="/images/no-data.svg"
          alt="No data found"
          width={128}
          height={128}
          className="mx-auto"
          priority
        />
        <div>
          <h2 className="text-center text-2xl text-black dark:text-white font-semibold leading-relaxed pb-1">
            {title}
          </h2>
          <p className="text-center text-black dark:text-white text-sm font-normal leading-snug pb-4">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
