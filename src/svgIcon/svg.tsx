const StarIcon: React.FC = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 13 13"
    fill="#F5A623"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6.5 0.5L8.1 4.3L12.3 4.7L9.1 7.5L10 11.7L6.5 9.5L3 11.7L3.9 7.5L0.7 4.7L4.9 4.3L6.5 0.5Z" />
  </svg>
);

interface HeartIconProps {
  filled?: boolean;
}

const HeartIcon: React.FC<HeartIconProps> = ({ filled = false }) => (
  <svg
    width="16"
    height="14"
    viewBox="0 0 16 14"
    fill={filled ? "#FF4D4D" : "none"}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 13C8 13 1 9.1 1 4.5C1 2.4 2.7 1 4.5 1C6 1 7.3 1.9 8 3C8.7 1.9 10 1 11.5 1C13.3 1 15 2.4 15 4.5C15 9.1 8 13 8 13Z"
      stroke={filled ? "#FF4D4D" : "#1E1E1E"}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GridIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="1"
      y="1"
      width="6"
      height="6"
      rx="1"
      stroke="white"
      strokeWidth="1.3"
    />
    <rect
      x="9"
      y="1"
      width="6"
      height="6"
      rx="1"
      stroke="white"
      strokeWidth="1.3"
    />
    <rect
      x="1"
      y="9"
      width="6"
      height="6"
      rx="1"
      stroke="white"
      strokeWidth="1.3"
    />
    <rect
      x="9"
      y="9"
      width="6"
      height="6"
      rx="1"
      stroke="white"
      strokeWidth="1.3"
    />
  </svg>
);

const ListIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 3H15M1 8H15M1 13H15"
      stroke="#1E1E1E"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);
const CloseIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 1L15 15M15 1L1 15"
      stroke="#1E1E1E"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
const ClockIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 4.5V8L10.5 9.5M14.5 8A6.5 6.5 0 1 1 1.5 8A6.5 6.5 0 0 1 14.5 8Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const ChevronLeft: React.FC = () => (
  <svg
    width="8"
    height="14"
    viewBox="0 0 8 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 1L1 7L7 13"
      stroke="#1E1E1E"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight: React.FC = () => (
  <svg
    width="8"
    height="14"
    viewBox="0 0 8 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 1L7 7L1 13"
      stroke="#1E1E1E"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const CartIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.5 1.5H3L4.7 9.8C4.8 10.3 5.3 10.7 5.8 10.7H12.5C13 10.7 13.5 10.3 13.6 9.8L14.7 4H3.5"
      stroke="white"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="6" cy="13.5" r="1" fill="white" />
    <circle cx="12" cy="13.5" r="1" fill="white" />
  </svg>
);

const BagIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 5V3.5C4 2.1 5.1 1 6.5 1H9.5C10.9 1 12 2.1 12 3.5V5M2.5 5H13.5L14 14H2L2.5 5Z"
      stroke="#37651B"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TruckIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 4H12V13H1V4Z"
      stroke="#37651B"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 7H15.5L18 10V13H12V7Z"
      stroke="#37651B"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="5" cy="15" r="1.5" stroke="#37651B" strokeWidth="1.3" />
    <circle cx="15" cy="15" r="1.5" stroke="#37651B" strokeWidth="1.3" />
  </svg>
);

export const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 4H14M6 4V2.5C6 2.2 6.2 2 6.5 2H9.5C9.8 2 10 2.2 10 2.5V4M3.5 4L4 13.5C4 13.8 4.2 14 4.5 14H11.5C11.8 14 12 13.8 12 13.5L12.5 4"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PinIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 13C7 13 11.5 9.2 11.5 5.5C11.5 3 9.5 1 7 1C4.5 1 2.5 3 2.5 5.5C2.5 9.2 7 13 7 13Z"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export const TagIcon = ({ color = "#37651B" }: { color?: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="10" cy="10" r="9" stroke={color} strokeWidth="1.3" />
    <path
      d="M7 13L13 7M8 8H8.01M12 12H12.01"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

export const BackArrowIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11 4L5 9L11 14"
      stroke="#1E1E1E"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);



export const FamilyTypeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="10.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M1 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M10.5 9c2 0 4 1.5 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);
export const OthersTypeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="3" cy="8" r="1.2" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="13" cy="8" r="1.2" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);


export const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2 7L8 2L14 7M3.5 6V13.5H12.5V6"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="5" width="15" height="9" rx="1.5" stroke="#37651B" strokeWidth="1.3" />
    <circle cx="9" cy="9.5" r="2" stroke="#37651B" strokeWidth="1.3" />
  </svg>
);

export const BkashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 14L9 3L15 14H3Z" stroke="#E2136E" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);

export const NagadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="7" stroke="#F7941D" strokeWidth="1.3" />
    <path d="M9 5V13M6.5 7H11.5" stroke="#F7941D" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const CardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="4" width="15" height="10" rx="1.5" stroke="#1E88E5" strokeWidth="1.3" />
    <path d="M1.5 7H16.5" stroke="#1E88E5" strokeWidth="1.3" />
  </svg>
);
export const OfficeTypeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5.5 5.5H6.5M9.5 5.5H10.5M5.5 8.5H6.5M9.5 8.5H10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);



export const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export   const defaultIcon = (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.88 5.97506L16.377 7.11748C16.231 7.18416 16.0884 7.25589 15.9482 7.33115V6.18436V5.34143C15.9482 4.26234 16.287 3.21037 16.9168 2.33405L17.5115 1.50657C17.8364 1.05442 17.3515 0.464379 16.845 0.695557L15.0907 1.49618C13.2549 2.33405 12.0771 4.1664 12.0771 6.18436C12.0771 4.1664 10.8992 2.33414 9.06344 1.49618L7.30926 0.695557C6.80272 0.464379 6.31779 1.05442 6.64276 1.50657L7.23744 2.33405C7.86721 3.21037 8.20591 4.26225 8.20591 5.34143V6.18436V7.33115C8.06578 7.25589 7.92316 7.18407 7.77711 7.11748L5.27414 5.97506C4.55135 5.6452 3.85953 6.48702 4.32309 7.13224L5.1716 8.31293C6.07014 9.5633 6.55352 11.0642 6.55352 12.604V13.8067H17.6005V12.604C17.6005 11.0642 18.0839 9.5633 18.9825 8.31293L19.831 7.13224C20.2947 6.48702 19.6028 5.64511 18.88 5.97506Z"
        fill="#97DA7B"
      />
      <path
        d="M7.77703 7.1173L5.27389 5.97514C4.8783 5.79408 4.493 5.96485 4.30078 6.26176L6.17578 7.1173C7.32995 7.58326 8.06622 7.3756 8.20609 7.33098C8.06622 7.25546 7.92291 7.18424 7.77703 7.1173ZM9.06335 1.49661L7.30935 0.695982C6.95752 0.535514 6.61685 0.770639 6.54992 1.08042L7.4621 1.49661C9.29762 2.33414 12.0771 4.80124 12.0771 6.18453C12.0771 4.16623 10.8997 2.33414 9.06335 1.49661ZM16.8448 0.695982L16.003 1.08042C16.033 1.21686 16.009 1.36875 15.9094 1.50691L15.3148 2.33414C15.3088 2.34272 15.3028 2.3513 15.2959 2.36074C14.3631 3.67624 14.4421 5.46027 15.4538 6.71656L15.9481 7.33098V5.34185C15.9481 4.26233 16.287 3.21028 16.9169 2.33414L17.5116 1.50691C17.8368 1.05468 17.3519 0.46429 16.8448 0.695982ZM18.8803 5.97514L18.2521 6.26176C18.4126 6.50718 18.4392 6.84013 18.2289 7.13189L17.3811 8.31267C16.4827 9.56295 15.9987 11.0638 15.9987 12.6041V13.8064H17.6008V12.6041C17.6008 11.0638 18.0839 9.56295 18.9824 8.31267L19.8311 7.13189C20.2944 6.48744 19.6028 5.64477 18.8803 5.97514Z"
        fill="#80D261"
      />
      <path
        d="M12.0528 38.1304C7.63935 38.1304 3.698 35.3679 2.19243 31.2192L2.11949 31.0181C0.50021 26.5562 0.50021 21.6672 2.11949 17.2053L2.19243 17.0042C3.698 12.8556 7.63935 10.093 12.0528 10.093H12.1526C16.5411 10.093 20.4657 12.8248 21.9895 16.9402C23.6383 21.393 23.6696 26.2836 22.0778 30.7571L21.9353 31.1573C20.4478 35.3381 16.4904 38.1304 12.0528 38.1304Z"
        fill="#FFD15B"
      />
      <path
        d="M23.2489 23.9699C23.2489 26.2654 22.8585 28.5609 22.0776 30.7568L21.9351 31.1576C20.448 35.3383 16.4904 38.1307 12.053 38.1307C11.6222 38.1307 11.1957 38.1041 10.7761 38.0526C14.6806 37.5737 18.0358 34.9316 19.3779 31.1576L19.5204 30.7568C20.3021 28.5609 20.6917 26.2646 20.6917 23.9691C20.6917 21.5878 20.2721 19.2074 19.4329 16.9402C18.053 13.2134 14.7046 10.6219 10.8259 10.1653C11.2301 10.1173 11.6394 10.0933 12.053 10.0933H12.1525C16.541 10.0933 20.466 12.8247 21.9892 16.9402C22.8293 19.2074 23.2489 21.5887 23.2489 23.9699Z"
        fill="#FFC344"
      />
    </svg>
  );

export const PlusIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 1V13M1 7H13"
      stroke="#37651B"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
export const HomeTypeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 7L8 2L14 7M3.5 6V13.5H12.5V6"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);


export {
  StarIcon,
  HeartIcon,
  GridIcon,
  ListIcon,
  CloseIcon,
  ChevronLeft,
  ChevronRight,
  CartIcon,
  TruckIcon,
  BagIcon,
  ClockIcon,
};
