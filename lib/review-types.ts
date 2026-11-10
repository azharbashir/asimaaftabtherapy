export type ReviewStatus='pending'|'approved'|'rejected';
export type Review={id:string;service:string;rating:number;displayName:string;body:string;createdAt:string};
export type ModeratedReview=Review & {status:ReviewStatus};
export type ReviewPage={reviews:Review[];total:number;page:number;pageSize:number;services:string[];summary:{total:number;average:number;distribution:number[]}};
