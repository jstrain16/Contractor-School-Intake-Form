import React from "react"

interface LoaderThreeProps {
  className?: string
  logoColor1?: string
  logoColor2?: string
  showText?: boolean
  text?: string
}

export function LoaderThree({
  className = "",
  logoColor1 = "#fea846",
  logoColor2 = "#9ba0a7",
  showText = false,
  text = "Loading...",
}: LoaderThreeProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative h-16 w-16 animate-pulse drop-shadow">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1024 1024"
          className="h-full w-full"
          aria-hidden="true"
        >
          <path
            d="M 158 298 L 144 328 L 138 351 L 131 412 L 137 489 L 153 549 L 179 605 L 212 651 L 237 676 L 255 687 L 257 692 L 309 722 L 365 739 L 413 743 L 448 740 L 480 733 L 530 713 L 578 682 L 628 634 L 665 585 L 701 519 L 711 481 L 710 465 L 704 445 L 686 422 L 680 421 L 679 416 L 645 400 L 612 396 L 571 401 L 530 413 L 471 439 L 439 449 L 416 448 L 408 440 L 405 441 L 376 487 L 402 504 L 426 510 L 466 508 L 513 493 L 534 483 L 535 479 L 542 479 L 552 471 L 567 465 L 608 437 L 647 417 L 663 418 L 667 425 L 668 438 L 662 462 L 640 522 L 607 576 L 606 582 L 600 585 L 592 599 L 588 600 L 558 633 L 552 634 L 525 655 L 495 670 L 455 681 L 426 685 L 379 683 L 333 672 L 329 667 L 315 663 L 310 657 L 290 647 L 285 640 L 280 640 L 279 635 L 272 632 L 271 628 L 255 615 L 255 611 L 232 584 L 208 535 L 190 473 L 185 440 L 183 394 L 186 356 L 199 299 L 209 283 L 222 281 L 234 290 L 292 391 L 296 392 L 298 401 L 332 452 L 370 397 L 348 373 L 330 347 L 322 343 L 322 337 L 304 316 L 272 287 L 267 287 L 266 283 L 254 276 L 231 269 L 197 271 L 175 281 Z"
            fill={logoColor1}
            fillRule="evenodd"
          />
          <path
            d="M 321 477 L 308 517 L 307 542 L 310 558 L 318 575 L 332 591 L 361 607 L 392 613 L 442 609 L 486 596 L 576 561 L 590 561 L 609 572 L 636 527 L 609 512 L 583 506 L 550 507 L 521 516 L 488 531 L 484 536 L 478 536 L 468 544 L 462 544 L 417 568 L 371 587 L 358 588 L 346 581 L 347 556 L 367 505 L 367 498 L 371 496 L 387 464 L 408 432 L 435 400 L 488 355 L 523 335 L 585 318 L 631 318 L 671 328 L 697 339 L 728 361 L 732 361 L 767 400 L 783 427 L 799 464 L 814 520 L 819 572 L 817 625 L 809 674 L 800 701 L 794 712 L 779 715 L 770 712 L 756 689 L 751 687 L 750 680 L 724 633 L 720 631 L 718 623 L 678 567 L 648 611 L 667 631 L 690 665 L 719 696 L 741 713 L 763 723 L 790 726 L 818 717 L 845 695 L 858 673 L 870 617 L 870 539 L 861 485 L 844 432 L 820 385 L 816 383 L 816 379 L 794 350 L 784 343 L 781 336 L 776 336 L 772 328 L 735 300 L 700 282 L 687 280 L 684 276 L 633 266 L 583 267 L 539 277 L 520 284 L 519 288 L 510 288 L 487 299 L 442 328 L 438 336 L 430 338 L 405 361 L 354 422 Z"
            fill={logoColor2}
            fillRule="evenodd"
          />
        </svg>
        <div className="absolute inset-0 rounded-full border-2 border-orange-200/80 animate-spin-slow" />
      </div>
      {showText && <div className="text-sm font-semibold text-slate-700">{text}</div>}
    </div>
  )
}

export function LoaderThreeFullScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <LoaderThree showText={true} />
    </div>
  )
}
