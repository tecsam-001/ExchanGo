import React from "react";
import Link from "next/link";
import Image from "next/image";

const footerLinks = [
  {
    heading: "Company",
    links: [
      { name: "About us", url: "/about-us" },
      { name: "Blog & news", url: "https://blog.exchango24.com" },
    ],
  },
  {
    heading: "Other",
    links: [
      { name: "Privacy policy", url: "/mentions-legales" },
      { name: "Cookie Policy", url: "/terms-and-conditions#cookies" },
      { name: "Legal", url: "/terms-and-conditions" },
      { name: "FAQ", url: "/faq" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="w-full relative overflow-hidden px-5">
      <div className="max-w-[1142px] mx-auto w-full pt-[60px] pb-[30px] sm:py-10 md:py-[60px]">
        <div className="flex items-center sm:items-start justify-center sm:justify-between md:flex-row flex-col-reverse gap-8 sm:gap-6">
          <div className="flex flex-col items-center md:items-start md:min-w-[298px] md:w-[298px]">
            <Link href="/">
              <Image
                src="/assets/logo.svg"
                alt="ExchangGo24"
                width={190}
                height={41.05}
                className="mb-4"
              />
            </Link>
            <p className="text-[14px] leading-[20px] font-normal text-[#585858] hidden md:block">
              hello.exchangego24@gmail.com
            </p>
            <p className="text-[14px] leading-[20px] font-normal text-[#585858] my-2.5 hidden md:block">
              (629) 555-0129
            </p>
            <p className="text-[14px] leading-[20px] font-normal text-[#585858]">
            229 RUE SAINT-HONORE, 75001 PARIS
            </p>

            <div className="mt-4 flex items-center gap-2">
              <Link href="https://web.facebook.com/" target="_blank">
                <div className="group flex items-center justify-center w-[32px] h-[32px] border border-[#EEEEEE99] hover:border-[#3BEE5C] hover:bg-[#3BEE5C] rounded-full *:fill-[#BFBFBF] hover:*:fill-[#111111] transition duration-300">
                  <svg width="16" height="17">
                    <path d="M10.3374 4.53806H11.5907V2.41806C10.9839 2.35496 10.3742 2.3238 9.76406 2.32473C7.95073 2.32473 6.71073 3.43139 6.71073 5.45806V7.20473H4.66406V9.57806H6.71073V15.6581H9.16406V9.57806H11.2041L11.5107 7.20473H9.16406V5.69139C9.16406 4.99139 9.35073 4.53806 10.3374 4.53806Z" />
                  </svg>
                </div>
              </Link>
              <Link href="https://x.com/" target="_blank">
                <div className="group flex items-center justify-center w-[32px] h-[32px] border border-[#EEEEEE99] hover:border-[#3BEE5C] hover:bg-[#3BEE5C] rounded-full *:fill-[#BFBFBF] hover:*:fill-[#111111] ">
                  <svg width="16" height="17">
                    <path d="M16 2.52764C15.3981 2.79014 14.7616 2.9646 14.11 3.04564C14.7967 2.63826 15.3101 1.9932 15.553 1.23264C14.91 1.61397 14.2065 1.88251 13.473 2.02664C13.0232 1.54642 12.4395 1.21256 11.7975 1.06843C11.1555 0.924307 10.485 0.97658 9.87318 1.21846C9.2613 1.46034 8.73632 1.88065 8.36642 2.42477C7.99653 2.9689 7.79883 3.61169 7.799 4.26964C7.799 4.52964 7.821 4.77964 7.875 5.01764C6.57008 4.95366 5.29336 4.61498 4.1283 4.02375C2.96325 3.43252 1.93609 2.60205 1.114 1.58664C0.692819 2.3085 0.562609 3.16375 0.749883 3.97824C0.937158 4.79273 1.42783 5.50523 2.122 5.97064C1.60276 5.95671 1.09447 5.81815 0.64 5.56664V5.60264C0.64087 6.36007 0.902665 7.09407 1.38132 7.6811C1.85997 8.26812 2.52625 8.67231 3.268 8.82564C2.98739 8.89959 2.69819 8.93591 2.408 8.93364C2.19959 8.93734 1.99139 8.91857 1.787 8.87764C1.99894 9.52866 2.40749 10.098 2.95639 10.5072C3.5053 10.9164 4.16756 11.1454 4.852 11.1626C3.69094 12.0707 2.25897 12.5633 0.785 12.5616C0.516 12.5616 0.258 12.5496 0 12.5166C1.49988 13.4832 3.24768 13.9945 5.032 13.9886C11.068 13.9886 14.368 8.98864 14.368 4.65464C14.368 4.50964 14.363 4.36964 14.356 4.23064C15.003 3.76762 15.5601 3.19052 16 2.52764Z" />
                  </svg>
                </div>
              </Link>
              <Link href="https://www.instagram.com/" target="_blank">
                <div className="group flex items-center justify-center w-[32px] h-[32px] border border-[#EEEEEE99] hover:border-[#3BEE5C] hover:bg-[#3BEE5C] rounded-full *:fill-[#BFBFBF] hover:*:fill-[#111111] ">
                  <svg width="16" height="17">
                    <path d="M7.99512 2.3208C10.4871 2.3208 11.733 2.32114 12.6611 2.85693C13.2692 3.20801 13.7749 3.71272 14.126 4.3208C14.6618 5.24899 14.6611 6.49565 14.6611 8.98779C14.6611 11.4795 14.6616 12.7257 14.126 13.6538C13.7749 14.2619 13.2692 14.7676 12.6611 15.1187C11.733 15.6543 10.4868 15.6538 7.99512 15.6538C5.50297 15.6538 4.25631 15.6544 3.32812 15.1187C2.72005 14.7676 2.21533 14.2619 1.86426 13.6538C1.32847 12.7257 1.32813 11.4798 1.32812 8.98779C1.32812 6.49548 1.32836 5.249 1.86426 4.3208C2.21531 3.7128 2.72013 3.20798 3.32812 2.85693C4.25633 2.32103 5.50281 2.3208 7.99512 2.3208ZM7.99707 5.65283C6.15638 5.65301 4.66424 7.14515 4.66406 8.98584L4.66797 9.15771C4.75437 10.8622 6.12161 12.2287 7.82617 12.3149L7.99707 12.3198C9.78048 12.3198 11.2369 10.9189 11.3262 9.15771L11.3311 8.98584C11.3309 7.20257 9.93007 5.74601 8.16895 5.65674L7.99707 5.65283ZM7.99707 6.71924C9.24881 6.71924 10.2635 7.73414 10.2637 8.98584C10.2637 10.2377 9.24892 11.2524 7.99707 11.2524C6.74537 11.2523 5.73047 10.2376 5.73047 8.98584C5.73064 7.73425 6.74548 6.71941 7.99707 6.71924ZM11.7939 4.22705C11.3706 4.22709 11.0274 4.57029 11.0273 4.99365C11.0273 5.41705 11.3706 5.76022 11.7939 5.76025C12.2174 5.76025 12.5605 5.41707 12.5605 4.99365C12.5605 4.57026 12.2173 4.22705 11.7939 4.22705Z" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          <div className="grid justify-items-center sm:justify-items-start text-center sm:text-start gap-[42px] sm:gap-6 grid-cols-1 sm:grid-cols-3 max-w-[675px] w-full">
            {footerLinks.map((section, i) => (
              <div
                key={i}
                className={
                  section.heading === "Feature" ? "hidden md:block" : ""
                }
              >
                <h5 className="text-[#111111] text-[14px] font-medium mb-4 sm:mb-6 leading-[20px]">
                  {section.heading}
                </h5>
                <div className="text-[#585858] text-[14px] leading-[20px] font-normal flex flex-col items-center sm:items-start gap-4">
                  {section.links.map((link, j) => (
                    <Link key={j} href={link.url}>
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-[1px] bg-[#BEBEBE] mb-6 sm:mb-[42px] mt-[42px] sm:mt-20 md:mt-[127px] opacity-50" />
        <div className="flex items-center justify-between sm:flex-row flex-col gap-2.5 sm:gap-4">
          <p className=" text-[#585858] text-[12px] sm:text-[14px] font-normal leading-[20px] sm:text-left text-center">
            ©2025 Iteration 1 Exchangego24 x Pixelzstudio™ all right reserved
          </p>
          <Link
            href="/terms-and-conditions"
            className=" text-[#585858] text-[12px] sm:text-[14px] font-normal leading-[20px] hover:text-[#111111] transition-colors"
          >
            Terms and condition
          </Link>
        </div>
      </div>
      <Image
        src="/assets/footer-vector.svg"
        alt="vector"
        width={550}
        height={627}
        className="sm:block hidden absolute bottom-0 left-0 -z-10"
      />
    </footer>
  );
};

export default Footer;
