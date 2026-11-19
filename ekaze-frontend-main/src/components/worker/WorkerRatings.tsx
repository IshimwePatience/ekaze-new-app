import { Star, ThumbsUp, MessageSquare, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Review {
  id: string;
  employerName: string;
  role: string;
  rating: number;
  review: string;
  date: string;
  helpful: number;
}

const reviews: Review[] = [
  {
    id: "1",
    employerName: "Habimana Family",
    role: "Housekeeper & Cook",
    rating: 5,
    review:
      "Claudine is an exceptional worker. She is reliable, thorough, and always goes above and beyond. Her cooking is excellent and she keeps our home spotless. Highly recommended!",
    date: "2023-05-30",
    helpful: 12,
  },
  {
    id: "2",
    employerName: "Kigali Cleaning Services",
    role: "Professional Cleaner",
    rating: 4.5,
    review:
      "Excellent team member. Always punctual and professional. Great attention to detail in her work. Would definitely hire again.",
    date: "2021-12-31",
    helpful: 8,
  },
  {
    id: "3",
    employerName: "Uwimana Family",
    role: "Nanny & Housekeeper",
    rating: 4.8,
    review:
      "Wonderful with our children. Very caring and responsible. The kids loved her! She also helped with housekeeping and was always thorough.",
    date: "2020-07-15",
    helpful: 15,
  },
  {
    id: "4",
    employerName: "Mugabo Household",
    role: "Housekeeper",
    rating: 4.5,
    review:
      "Great work ethic and very trustworthy. Claudine is punctual and does excellent work. We appreciated her service during our time together.",
    date: "2019-01-20",
    helpful: 6,
  },
];

const ratingDistribution = [
  { stars: 5, count: 8, percentage: 67 },
  { stars: 4, count: 3, percentage: 25 },
  { stars: 3, count: 1, percentage: 8 },
  { stars: 2, count: 0, percentage: 0 },
  { stars: 1, count: 0, percentage: 0 },
];

interface WorkerRatingsProps {
  limit?: number;
}

const WorkerRatings = ({ limit }: WorkerRatingsProps) => {
  const displayReviews = limit ? reviews.slice(0, limit) : reviews;
  const averageRating = 4.7;
  const totalReviews = 12;

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : star - 0.5 <= rating
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {!limit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Rating Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-5xl font-bold text-foreground mb-2">
                  {averageRating}
                </div>
                <div className="flex justify-center mb-2">
                  <StarRating rating={averageRating} />
                </div>
                <p className="text-muted-foreground">
                  Based on {totalReviews} reviews
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {ratingDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3">
                    <span className="text-sm w-12">{item.stars} stars</span>
                    <Progress value={item.percentage} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground w-8">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex text_sm items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              {limit ? "Recent Reviews" : "All Reviews"}
            </span>
            <Badge variant="secondary">
              {averageRating} avg • {totalReviews} reviews
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayReviews.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {review.employerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h4 className="font-semibold text_sm text-foreground">
                        {review.employerName}
                      </h4>
                      <Badge variant="outline" className="text-xs w-fit">
                        {review.role}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <StarRating rating={review.rating} />
                      <span className="text-sm font-medium">{review.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        • {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text_sm text-muted-foreground leading-relaxed">
                      "{review.review}"
                    </p>

                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-1 text_sm text-muted-foreground hover:text-foreground transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        <span>Helpful ({review.helpful})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkerRatings;
