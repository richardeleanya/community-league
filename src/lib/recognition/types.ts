export type RecognitionCounts = {
  currentSeasons: number;
  awardTypes: number;
  awardRows: number;
  publishedAwards: number;
  rankingRows: number;
  leagueTableRows: number;
  approvedActions: number;
  supporterProfiles: number;
  clubs: number;
  topSupporterPoints: number;
  topClubPoints: number;
};

export type RecognitionAwardTypeOption = {
  value: string;
  label: string;
  sortOrder: number;
};

export type RecognitionCandidate = {
  awardType: string;
  recipientType: 'supporter' | 'club' | 'community_action';
  recipientId: string;
  recipientName: string;
  clubName: string | null;
  points: number;
  rank: number | null;
  basis: string;
  proofReference: string;
};

export type RecognitionReadiness = {
  moderationFoundationAccepted: true;
  currentSeasonAvailable: boolean;
  awardEnumAvailable: boolean;
  supporterRankingAvailable: boolean;
  clubRankingAvailable: boolean;
  approvedActionAvailable: boolean;
  recognitionCandidateReadable: boolean;
  awardsTableReadable: boolean;
};

export type RecognitionSnapshot = {
  generatedAt: string;
  headline: string;
  counts: RecognitionCounts;
  awardTypes: RecognitionAwardTypeOption[];
  candidates: RecognitionCandidate[];
  readiness: RecognitionReadiness;
};