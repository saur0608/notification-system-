provider "aws" {
  region = "us-east-1"
}

# RDS Postgres
resource "aws_db_instance" "postgres" {
  allocated_storage    = 100
  engine               = "postgres"
  engine_version       = "14.1"
  instance_class       = "db.t3.large"
  name                 = "notificationdb"
  username             = var.db_user
  password             = var.db_pass
  skip_final_snapshot  = true
  publicly_accessible  = false
  multi_az             = true
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "notification-redis"
  engine               = "redis"
  node_type            = "cache.t3.medium"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis6.x"
  port                 = 6379
}

# EKS Cluster
module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  cluster_name    = "notification-cluster"
  cluster_version = "1.27"
  subnets         = ["subnet-abcde012", "subnet-bcde012a"]
  vpc_id          = "vpc-1234556abcdef"

  node_groups = {
    workers = {
      desired_capacity = 3
      max_capacity     = 10
      min_capacity     = 3
      instance_type    = "m5.large"
    }
  }
}
